import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, Col, Button, Modal, } from '@themesberg/react-bootstrap';
import useWebSocket from 'react-use-websocket';

import ElapsedTime from '../ElapsedTime'
import OperationCard from './OperationCard';

import automationService from '../../../../services/AutomationsService'

function AutomationCard({ automation, updateOut }) {
    const [error, setError] = useState('');
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => setShow(false);

    const [automationInfo, setAutomationInfo] = useState({});
    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
        onOpen: () => console.log('Connected to WebSocket server'),
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.automationInfo) {
                    automationInfo[lastJsonMessage.automationInfo.id] = lastJsonMessage.automationInfo;
                    setAutomationInfo(automationInfo);
                }
            }
        },
        queryParams: { "token": localStorage.getItem('token') },
        onError: (err) => console.error(err),
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    })

    async function cancelOperation() {
        setError('');
        setIsLoading(true);

        try {
            const resp = await automationService.cancelAutomation(automation.id);

            switch (resp.status) {
                case 204:
                    console.log('Automação cancelada com sucesso!');
                    setIsLoading(false);
                    handleClose();
                    updateOut();
                    break;
                case 208:
                    setError(resp.data);
                    break;
            }
        }
        catch (err) {
            console.log(err)
            setError('Impossível cancelar operação');
        }
    }

    return (
        <>
            {/* {console.log('printing in AutoCard', automation)} */}
            <Card as='a' className='border-0 automation-card shadow' style={{ width: '100%', height: '360px' }} onClick={e => setShow(true)}>

                <Card.Header className='d-flex justify-content-between align-items-center mb-0 fw-bolder py-2 bg-white'>
                    <p className='mb-0'>#{automation.id}</p>
                    <span style={{ color: '#3ae374' }}>
                        {automation.loop ? <FontAwesomeIcon className='m=0' icon={faSyncAlt} /> : <></>}
                    </span>

                </Card.Header>

                <Card.Body className='d-flex flex-column'>
                    {/* <OperationCard data={automationInfo[automation.id]} first={automation.first} />
                    {automation.second && <OperationCard data={automationInfo[automation.id]} second={automation.second} />} */}
                </Card.Body>

                <Card.Footer className={`px-3 py-2  bg-${automation.status === 'RUNNING' ? 'secondary' : automation.status === 'CANCELED' ? 'danger' : 'success'}`}>
                    <Col className='d-flex inline-flex justify-content-between align-items-center mb-2'>
                        <small>Tempo em execução:</small>
                        <small className='fw-bolder'><ElapsedTime startAt={automation.createdAt} endAt={automation.finishedAt || null} /></small>
                    </Col>

                    <Col className='d-flex inline-flex justify-content-between align-items-center'>
                        <small>{automation.status === 'RUNNING' ? 'Rodando...' : automation.status === 'CANCELED' ? 'Cancelada!' : 'Finalizada!'}</small>
                        <span className='d-flex justify-content-between align-items-center'>
                            <FontAwesomeIcon style={{ fontSize: '15px' }} className='me-1' icon={faRedoAlt} />
                            <small className='mb-0'> : {automation.runs}</small>
                        </span>
                    </Col>
                </Card.Footer>

            </Card>

            <Modal as={Modal.Dialog} centered show={show} onHide={handleClose} >
                <Modal.Header className='justify-content-between align-items-center mb-0 fw-bolder'>
                    ID: #{automation.id}
                    <Button variant='close' onClick={handleClose} />
                </Modal.Header>

                <Modal.Body>
                    Em breve mais informações sobre a automação...
                </Modal.Body>

                {
                    automation.status === 'RUNNING' &&
                    <Modal.Footer>
                        <Button variant="danger" className='w-100 btn-sm' disabled={isLoading} onClick={cancelOperation}>Cancelar operação</Button>
                    </Modal.Footer>
                }

                {
                    error
                        ? <div className='mx-3 alert alert-danger mt-1 p-1'>{error}</div>
                        : <></>
                }
            </Modal>
        </>
    )
}

export default AutomationCard;