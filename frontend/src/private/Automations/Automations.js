import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Modal, Form } from '@themesberg/react-bootstrap';

import './AutomationStyles.css'
import Menu from '../../components/Menu';
import NewAutomationModal from './Components/NewAutomationModal';

import AutomationCard from './Components/AutomationCard';
import automationsService from '../../services/AutomationsService';

function Automations() {

    const [automations, setAutomations] = useState('');
    const [error, setError] = useState('');

    function updateAutomations() {
        automationsService.getAutomations()
            .then(resp => {
                console.log(resp);
                setAutomations(resp)
            });
    }

    useEffect(() => {
        updateAutomations();
    }, [])

    return (
        <>
            <Menu />
            <main className='content px-3 pb-3'>
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 pt-3">
                    <div className="d-block mb-md-0">
                        <h3 className='mb-0'>Suas operações</h3>
                    </div>
                </div>
                <Row>
                    <Col>
                        <Card bg='light' className='border-2 containHeight px-2 pt-2 mh-25'>
                            <Row className='d-flex flex-wrap justify-content-start'>
                                {
                                    automations ?
                                        automations.map(automation => (
                                            <Col key={automation.id} sm={12} md={4} lg={3} className='d-flex align-items-center mb-3'>
                                                <AutomationCard automation={automation} updateOut={updateAutomations} />
                                            </Col>
                                        )) :
                                        <div>Carregando automações...</div>
                                }
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <NewAutomationModal updateOut={updateAutomations} />
            </main>
        </>
    )
}

export default Automations;