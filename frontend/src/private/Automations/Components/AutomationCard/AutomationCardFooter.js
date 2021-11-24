import React, { useState, useEffect, useMemo } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { Col } from '@themesberg/react-bootstrap';
import ElapsedTime from './ElapsedTime'

export default function AutomationCardFooter({ automation }) {
    const [info, setInfo] = useState({
        runs: automation.runs,
        status: automation.status,
        createdAt: automation.createdAt,
        finishedAt: automation.finishedAt,
    });

    const footerMemo = useMemo(() => (
        <>
            <Col className='d-flex inline-flex justify-content-between align-items-center mb-2'>
                <small>Tempo em execução:</small>
                <small className='fw-bolder'><ElapsedTime startAt={info.createdAt} endAt={info.finishedAt || null} /></small>
            </Col>

            <Col className='d-flex inline-flex justify-content-between align-items-center'>
                <small>{info.status === 'RUNNING' ? 'Rodando...' : info.status === 'CANCELED' ? 'Cancelada!' : 'Finalizada!'}</small>
                <span className='d-flex justify-content-between align-items-center'>
                    <FontAwesomeIcon style={{ fontSize: '15px' }} className='me-1' icon={faRedoAlt} />
                    <small className='mb-0'> : {info.runs}</small>
                </span>
            </Col>
        </>
    ), [])

    useEffect(() => {
        if (!automation) return;

        if (automation.runs && info.runs !== automation.runs) info.runs = automation.runs;
        if (automation.automationStatus && info.status !== automation.status) info.status = automation.automationStatus;
        if (automation.createdAt && info.createdAt !== automation.createdAt) info.createdAt = automation.createdAt;
        if (automation.finishedAt && info.finishedAt !== automation.finishedAt) info.finishedAt = automation.finishedAt;

        setInfo(info);
    }, [automation]);

    return footerMemo;
}