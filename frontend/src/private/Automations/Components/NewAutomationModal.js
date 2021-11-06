import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Button, Modal, Form } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import symbolService from '../../../services/SymbolService';
import NewAutomationButton from './NewAutomationButton';
import SelectSymbol from './SelectSymbol';
import SelectSide from './SelectSide';
import FloatValues from './FloatValues';
import Margin from './Margin';
import LoopOperations from './LoopOperations';

import automationsService from '../../../services/AutomationsService';

export default function NewAutomationModal({ updateOut }) {

    const [error, setError] = useState('');
    const [symbols, setSymbols] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [second, setSecond] = useState(false);
    const [loop, setLoop] = useState(false);

    const DEFAULT_ORDER = {
        operation_1: {
            symbol: { symbol: 'AAVE', name: 'Aave', margin: true, precision: 4 },
            side: 'BUY',
            margin: false,
            agio: '',
            vol: '',
            tol: ''
        },
        operation_2: {
            symbol: { symbol: 'AAVE', name: 'Aave', margin: true, precision: 4 },
            side: 'SELL',
            margin: false,
            agio: '',
            vol: '',
            tol: ''
        },
        loop: false
    }

    const [order, setOrder] = useState(DEFAULT_ORDER);

    const handleClose = () => setShowModal(false);

    function afterClose() {
        setError('');
        setLoop(false);
        setSecond(false)
        setIsLoading(false);
        setOrder(DEFAULT_ORDER);
    }

    async function loadSymbols() {
        try {
            const buffer = await symbolService.getSymbols();
            setSymbols(buffer.map(s => { return { symbol: s.currency, name: s.name, margin: s.margin, precision: s.precisionBNC } }));
        }
        catch (err) {
            console.log(err)
            setIsLoading(true);
            setError('Falha no carregamento de dados');
        }
    }

    async function onInputChange(e, i) {
        setError('');
        const newState = { ...order };

        if (e.target.id === 'loop') setLoop(!loop);

        if (e.target.id === 'symbol') {
            newState[`operation_${i}`].margin = false;
            newState[`operation_${i}`].agio = ''; newState[`operation_${i}`].vol = ''; newState[`operation_${i}`].tol = '';
            newState[`operation_${i}`].symbol = e.target.value;
        }

        if (e.target.id === 'side' && i === 1) {
            newState[`operation_${i}`].side = e.target.value === 'BUY' ? 'SELL' : 'BUY';
            newState.operation_2.side = e.target.value === 'BUY' ? 'BUY' : 'SELL';
        }
        if (e.target.id === 'margin') newState[`operation_${i}`].margin = !newState[`operation_${i}`].margin;

        if (e.target.id === 'agio') if (/^$|^\d+[\.,]?\d*?$/.test(e.target.value)) newState[`operation_${i}`].agio = e.target.value;
        if (e.target.id === 'vol') if (new RegExp(`^$|^\\d+[\\.,]?\\d{0,${newState[`operation_${i}`].symbol.precision}}?$`).test(e.target.value)) newState[`operation_${i}`].vol = e.target.value;
        if (e.target.id === 'tol') if (/^$|^\d+[\.,]?\d{0,1}?\%?$/.test(e.target.value)) newState[`operation_${i}`].tol = e.target.value;

        setOrder(newState);
    }

    function prepareAutomation() {
        return new Promise(resolve => {
            const automation = { 
                loop, 
                symbol: order.operation_1.symbol.symbol,
                margin: order.operation_1.margin,
                first: {}
            };

            if(second) automation.second = {};

            const l = second ? 2 : 1;
            for (let i = 1; i <= l; i++) {
                automation[`${i === 1 ? 'first' : 'second'}`].tol = order[`operation_${i}`].tol ? parseFloat(order[`operation_${i}`].tol.replace('%', '')) : 0.5
                automation[`${i === 1 ? 'first' : 'second'}`].vol = parseFloat(order[`operation_${i}`].vol);
                automation[`${i === 1 ? 'first' : 'second'}`].agio = parseFloat(order[`operation_${i}`].agio);
                automation[`${i === 1 ? 'first' : 'second'}`].side = order[`operation_${i}`].side;
            }

            !second && delete automation.operation_2;
            resolve(automation);
        })
    }

    async function onSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            setError('');

            const automation = await prepareAutomation();
            const resp = await automationsService.insertAutomation(automation);

            if (resp.status === 201) {
                console.log('Automação criada com sucesso!');
                handleClose();
                updateOut();
                setIsLoading(false);
            }
        }
        catch (err) {
            console.error(err);
            setError('Saldo insuficiente parar criar ordem');
            setIsLoading(false);
        }
    }

    useEffect(() => { loadSymbols() }, []);

    return (
        <>
            <NewAutomationButton onClick={e => setShowModal(true)} />

            <Modal as={Modal.Dialog} centered show={showModal} onHide={handleClose} onExited={afterClose}>
                <Form onSubmit={onSubmit}>
                    <Modal.Header className='justify-content-center p-2'>
                        <Modal.Title className="h5">Nova operação</Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>

                        <Card className='px-4 py-3 border-3 shadow mb-3' style={{ height: '155px' }}>
                            <Row className='d-flex align-items-center justify-content-center'>
                                <Col xs={6} className='p-0'>
                                    <SelectSymbol
                                        symbols={symbols}
                                        value={order.operation_1.symbol}
                                        selected={order.operation_1.symbol || symbols[0]}
                                        onChange={e => { onInputChange(e, 1); onInputChange(e, 2); }}
                                    />
                                    <div className='d-flex justify-content-between'>
                                        <SelectSide
                                            side={order.operation_1.side === 'BUY' ? false : true}
                                            onChange={e => onInputChange(e, 1)}
                                        />
                                        <Margin
                                            margin={order.operation_1.margin}
                                            selectedSymbol={order.operation_1.symbol || symbols[0]}
                                            onChange={e => onInputChange(e, 1)}
                                        />
                                    </div>
                                </Col>
                                <Col xs={6} className='p-0'>
                                    <FloatValues
                                        agio={order.operation_1.agio}
                                        vol={order.operation_1.vol}
                                        tol={order.operation_1.tol}
                                        onChange={e => onInputChange(e, 1)}
                                        selectedSymbol={order.operation_1.symbol || symbols[0]}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {
                            second ?
                                <Card className='px-4 py-3 border-3 shadow mb-3' style={{ height: '155px' }}>
                                    <div className="position-absolute top-0 start-100 translate-middle">
                                        <a style={{ fontSize: '24px' }} onClick={e => setSecond(false)}>
                                            <FontAwesomeIcon className='m=0 text-danger' icon={faTimesCircle} />
                                        </a>
                                    </div>
                                    <Row className='d-flex align-items-center justify-content-center'>
                                        <Col xs={6} className='p-0'>
                                            <SelectSymbol
                                                symbols={symbols}
                                                value={order.operation_2.symbol}
                                                selected={order.operation_2.symbol || symbols[0]}

                                                disabled={true}
                                            />
                                            <div className='d-flex justify-content-between'>
                                                <SelectSide
                                                    side={order.operation_2.side === 'BUY' ? false : true}
                                                    disabled={true}
                                                />
                                                <Margin
                                                    margin={order.operation_1.margin}
                                                    selectedSymbol={order.operation_1.symbol || symbols[0]}
                                                    onChange={e => onInputChange(e, 2)}
                                                    disabled={true}
                                                />
                                            </div>
                                        </Col>
                                        <Col xs={6} className='p-0'>
                                            <FloatValues
                                                agio={order.operation_2.agio}
                                                vol={order.operation_2.vol}
                                                tol={order.operation_2.tol}
                                                onChange={e => onInputChange(e, 2)}
                                                selectedSymbol={order.operation_1.symbol || symbols[0]}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                                :
                                <Button
                                    onClick={e => setSecond(true)}
                                    className='px-4 py-3 border-3 mb-3 btn-secondary card d-flex align-items-center justify-content-center'
                                    style={{ height: '155px', width: '468px', borderStyle: 'dashed' }}
                                >
                                    <span style={{ fontSize: '48px' }}>
                                        <FontAwesomeIcon className='m=0 text-light' icon={faPlusCircle} />
                                    </span>
                                </Button>
                        }


                    </Modal.Body>

                    <Modal.Footer className='d-flex justify-content-between p-2 px-4'>
                        <Button variant="success" disabled={isLoading} className='w-25 btn-sm' type='submit'>Iniciar</Button>
                        <Form.Group className='d-flex align-items-center justify-content-center me-1'>
                            <LoopOperations onChange={e => onInputChange(e)} loop={loop} />
                        </Form.Group >
                        <Button variant="danger" disabled={isLoading} className='w-25 btn-sm' onClick={handleClose}>Cancelar</Button>
                    </Modal.Footer>
                    {
                        error
                            ? <div className='mx-3 alert alert-danger mt-1 p-1'>{error}</div>
                            : <></>
                    }
                </Form>
            </Modal>
        </>
    );
}