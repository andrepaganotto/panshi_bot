import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Card, Form, Button, InputGroup, Toast } from '@themesberg/react-bootstrap';

import Menu from "../../components/Menu";
import settingsService from '../../services/SettingsService';

export default function Settings() {

    const inputConfirmPassword = useRef('');
    const [settings, setSettings] = useState({});
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        settingsService.getSettings()
            .then((settings) => {
                setSettings(settings);
            })
            .catch((err) => {
                console.error(err.response ? err.response.data : err.message);
                setError(err.response ? err.response.data : err.message);
            })
    }, [])

    function onInputChange(event) {
        const newState = { ...settings };

        if (event.target.id === 'password') newState.password = event.target.value;
        if (event.target.id === 'keyBNC') newState.keyBNC = event.target.value;
        if (event.target.id === 'secretBNC') newState.secretBNC = event.target.value;
        if (event.target.id === 'keyMBTC') newState.keyMBTC = event.target.value;
        if (event.target.id === 'secretMBTC') newState.secretMBTC = event.target.value;

        setSettings(newState);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if ((settings.password || inputConfirmPassword.current.value) && settings.password !== inputConfirmPassword.current.value) {
            setSuccess('');
            setError('As senhas não conferem!')
            return setShow(true);
        }

        const resp = await settingsService.setSettings(settings);
        if (resp === 200) {
            setError('');
            setSuccess('Dados atualizados com sucesso');
            setShow(true);
        }
        else setError('Não foi possível atualizar as informações');
    }

    return (
        <>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-md-0">
                        <h3 className='mb-0'>Configurações</h3>
                    </div>
                </div>
                <Row>
                    <Col>
                        <Card body className='border-0 shadow mb-4'>
                            <Form onSubmit={handleSubmit}>
                                <Card.Title>Informações da conta</Card.Title>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Email</Form.Label>
                                            <InputGroup>
                                                <Form.Control type="text" placeholder={settings.email} readOnly />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Nova senha</Form.Label>
                                            <Form.Control id='password' type="password" placeholder="Digite a nova senha" onChange={e => onInputChange(e)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Confirme a nova senha</Form.Label>
                                            <Form.Control ref={inputConfirmPassword} id='confirmPassword' type="password" placeholder="Confirme a nova senha" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Card.Title className='mt-4'>Configurações de API</Card.Title>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Key Binance</Form.Label>
                                            <Form.Control id='keyBNC' type="text" defaultValue={settings.keyBNC} placeholder="Chave de acesso API Binance" onChange={onInputChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Secret Binance</Form.Label>
                                            <Form.Control id='secretBNC' type="password" placeholder="Segredo de API Binance" onChange={onInputChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Key Mercado Bitcoin</Form.Label>
                                            <Form.Control id='keyMBTC' type="text" defaultValue={settings.keyMBTC} placeholder="Chave de acesso API Mercado BTC" onChange={onInputChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Secret Mercado Bitcoin</Form.Label>
                                            <Form.Control id='secretMBTC' type="password" placeholder="Segredo de API Mercado BTC" onChange={onInputChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <div className="d-flex justify-content-left flex-wrap flex-md-nowrap">
                                        <Col sm={3}>
                                            <Button className="btn btn-gray-800 mt-2 animate-up-2" type="submit">Salvar</Button>
                                        </Col>
                                    </div>
                                </Row>
                            </Form>
                        </Card>
                    </Col>

                </Row>
            </main>
            <Toast className={`bg-${error ? 'danger' : 'success'} d-flex justify-content-center align-items-center position-absolute bottom-0 end-0 m-3`} onClose={() => setShow(false)} show={show} autohide>
                <Toast.Body className='text-white fw-bolder'>
                    {
                        error || success
                    }
                </Toast.Body>
            </Toast>
        </>
    )
}