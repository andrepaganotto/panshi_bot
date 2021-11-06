import React, { useState, useEffect } from 'react';
import settingsService from '../../services/SettingsService';
import { Card, Col, Row } from '@themesberg/react-bootstrap';

function Wallet(props) {
    const [balance, setBalance] = useState({});
    const [dolar, setDolar] = useState('');

    async function organizeBalance(data) {
        if (data.BNC && data.MBTC && data.dolar) {
            data.BNC.free = (parseFloat(data.BNC.free)).toFixed(2);
            data.BNC.locked = (parseFloat(data.BNC.locked)).toFixed(2);
            data.BNC.total = (parseFloat(data.BNC.free + data.BNC.locked)).toFixed(2)

            data.MBTC.available = (parseFloat(data.MBTC.available)).toFixed(2);
            data.MBTC.total = (parseFloat(data.MBTC.total)).toFixed(2);
            data.MBTC.locked = (parseFloat(data.MBTC.total - data.MBTC.available)).toFixed(2);
        }
        setBalance(data);
        setDolar(data.dolar);
    }

    async function getBalanceCall() {
        organizeBalance(await settingsService.getBalance());
    }

    useEffect(() => {
        if (props.balance && Object.keys(props.balance).length) {
            organizeBalance(props.balance);
        } else getBalanceCall();
    }, [props.balance]);

    return (
        <>
            <Card border="light" className='shadow-sm mb-3 pt-3 px-3 pb-1'>
                <Card.Title>
                    Carteira
                </Card.Title>
                {
                    balance.MBTC && balance.BNC ?
                        <div>
                            <Row className='d-flex justify-content-center align-items-start'>
                                <Col className='border-end w-50'>
                                    <div className='d-flex align-items-center justify-content-center my-3'>
                                        <img width='48' height='48' src={`img/logoMBTC.svg`} />
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center mb-2'>
                                        <h6 className='mb-0'>Livre:</h6>
                                        <p className='mb-0'>R$ {balance.MBTC.available}</p>
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center mb-3'>
                                        <h6 className='mb-0'>Em ordens:</h6>
                                        <p className='mb-0'>R$ {balance.MBTC.locked}</p>
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center border-top pt-2'>
                                        <h5 className='mb-0'>Total:</h5>
                                        <h4 className='mb-0 text-success'>R$ {balance.MBTC.total}</h4>
                                    </div>
                                </Col>
                                <Col className='w-50'>
                                    <div className='d-flex align-items-center justify-content-center my-3'>
                                        <img width='48' height='48' src={`img/logoBNC.svg`} />
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center mb-2'>
                                        <h6 className='mb-0'>Livre:</h6>
                                        <p className='mb-0'>$ {balance.BNC.free}</p>
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center mb-3'>
                                        <h6 className='mb-0'>Em ordens:</h6>
                                        <p className='mb-0'>$ {balance.BNC.locked}</p>
                                    </div>
                                    <div className='d-flex flex-column justify-content-center align-items-center border-top pt-2'>
                                        <h5 className='mb-0'>Total:</h5>
                                        <h4 className='mb-0 text-success'>$ {balance.BNC.total}</h4>
                                    </div>
                                </Col>
                            </Row>
                            <Row className='d-flex justify-content-center align-items-center'>
                                <Col>
                                    <div className='d-flex flex-column justify-content-center align-items-center border-top pt-2 mt-2'>
                                        <h6 className='mb-0'>Saldo total:</h6>
                                        <div className='d-inline-flex align-items-center'>
                                            <h4 className='mb-0 text-success'>R$ {(parseFloat(balance.BNC.total * parseFloat(dolar)) + parseFloat(balance.MBTC.total)).toFixed(2)}</h4>
                                            <p className='mb-0 small ms-1 fw-lighter'>(Dolar: R$ {dolar})</p>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div> :
                        <div className='d-flex justify-content-center mb-3'>
                            <h6 className='mb-0'>Carregando...</h6>
                        </div>
                }
            </Card>
        </>
    );
}

export default Wallet;