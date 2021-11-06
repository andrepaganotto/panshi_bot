import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { Col, Card } from "@themesberg/react-bootstrap";

import ElapsedTime from "./ElapsedTime";

export default function OperationCard({ data, first, second }) {
    const operation = first || second

    const [info, setInfo] = useState({
        priceBNC: operation.priceBNC,
        priceMBTC: operation.priceMBTC,
        agioDiff: '',
        status: operation.status
    });

    const operationMemo = useMemo(() => (
        <Card style={{ height: '50%' }}
            className={`${first ? 'mb-1' : 'mb-0'} p-2`}
        >
            <Col className='d-flex inline-flex align-items-center justify-content-center'>
                <img width='26' height='26' src={`./img/crypto-icons/${operation.symbol.toLowerCase()}.svg`} />
                <p className='m-0 ms-1 fw-bolder'>{operation.symbol}</p>
                {operation.margin ? <p className='mb-0 ms-2 ps-2 border-start' style={{ color: '#3ae374', fontWeight: 'bolder' }}>M</p> : <></>}
                <small className='mb-0 fw-lighter fst-italic border-start ps-2 ms-2'>{info.status === 'QUEUE' ? 'Na fila' : info.status === 'RUNNING' ? 'Executando...' : 'Finalizada!'}</small>
            </Col>
            <Col className='d-flex inline-flex align-items-center justify-content-center'>
                {
                    operation.side === 'BUY'
                        ? <p className='text-success fw-bolder mb-0'>C</p>
                        : <p className='text-danger fw-bolder mb-0'>V</p>

                }
                <p className='mb-0 ms-2 ps-2 border-start fw-bolder'>{operation.vol}</p>
                <p className={`mb-0 fw-bolder text-${operation.side === 'BUY' ? 'success' : 'danger'}`}>
                    <FontAwesomeIcon className='m-0 p-0 mx-2' icon={faCaretRight} />
                    {parseFloat(operation.agio).toFixed(2)}
                </p>
                <p className='mb-0 ms-2 ps-2 border-start fw-bolder'>
                    {operation.tol}%

                    {
                        info.status === 'RUNNING' &&
                        <>
                            <FontAwesomeIcon className='m-0 p-0 mx-2' icon={faCaretRight} />
                            {`${(parseFloat(info.agioDiff) * 100).toFixed(2)}%`}
                        </>
                    }
                </p>
            </Col>
            {
                (info.status === 'RUNNING' || info.status === 'FINISHED') &&
                <Col className='d-flex inline-flex align-items-center justify-content-center'>
                    <p className={`mb-0 fw-bolder text-${operation.side === 'BUY' ? 'success' : 'danger'}`}>{`R$ ${info.priceMBTC}`}</p>
                    {
                        (
                            info.priceBNC &&
                            <p className={`mb-0 fw-bolder ms-2 ps-2 border-start text-${operation.side === 'BUY' ? 'danger' : 'success'}`}>
                                {`$ ${info.priceBNC}`}
                            </p>
                        )
                        ||
                        <small className='mb-0 fst-italic ms-2 ps-2 border-start'>
                            <ElapsedTime startAt={operation.createdAt} endAt={operation.finishedAt || null} />
                        </small>
                    }
                </Col>
            }

        </Card>
    ), [info.agioDiff, info.priceBNC, info.priceMBTC, info.status]);

    useEffect(() => {
        if (!data) return;

        if (data.priceBNC && info.priceBNC !== data.priceBNC) info.priceBNC = data.priceBNC;
        if (data.priceMBTC && info.priceMBTC !== data.priceMBTC) info.priceMBTC = data.priceMBTC;
        if (data.agioDiff && info.agioDiff !== data.agioDiff) info.agioDiff = data.agioDiff;
        if (data.status && info.status !== data.status) info.status = data.status;

        setInfo(info);
    }, [data]);

    return operationMemo;
}