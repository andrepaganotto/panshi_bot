import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Container, Row, Col, Form, InputGroup, FormCheck, Card, Button } from '@themesberg/react-bootstrap';
import { useHistory } from "react-router-dom";
import authService from "../services/AuthService";

export default function Login() {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(event) {
        event.preventDefault();
        try {
            const isValid = await authService.login(email, password);
            if (isValid) history.push('/dashboard');
        }
        catch (err) {
            setError(err);
        }
    }

    useEffect(() => {
        if (authService.isAuthenticated()) {
            authService.isValidToken()
                .then(isValid => {
                    if (isValid) history.push('/dashboard');
                })
        }
    }, [])

    return (
        <>
            <main>
                <section className="d-flex align-items-center my-5 mt-lg-4 mb-lg-5">
                    <Container>
                        <Row className="justify-content-center form-bg-image">
                            <div className='text-center text-md-center mb-lg-4'>
                                <img src='/img/favicon/android-chrome-192x192.png' alt='Panshi'></img>
                            </div>
                            <Col className='d-flex align-items-center justify-content-center form-bg-image'>
                                <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                                    <div className="text-center text-md-center mb-4 mt-md-0">
                                        <h3 className="mb-0">Acesse o Panshi</h3>
                                    </div>
                                    <Form className="mt-4" onSubmit={handleLogin}>

                                        <Form.Group id="email" className="mb-4">
                                            <Form.Label>Login:</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <FontAwesomeIcon icon={faEnvelope} />
                                                </InputGroup.Text>
                                                <Form.Control autoFocus required type="email" placeholder="Seu email" onChange={e => setEmail(e.target.value)} />
                                            </InputGroup>
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Group id='password' className='mb-4'>
                                                <Form.Label>Senha:</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <FontAwesomeIcon icon={faUnlockAlt} />
                                                    </InputGroup.Text>
                                                    <Form.Control required type='password' placeholder='••••••••' onChange={e => setPassword(e.target.value)} />
                                                </InputGroup>
                                            </Form.Group>
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <Form.Check type="checkbox">
                                                    <FormCheck.Input id="defaultCheck5" className="me-2" />
                                                    <FormCheck.Label htmlFor="defaultCheck5" className="mb-0">Lembrar-me</FormCheck.Label>
                                                </Form.Check>
                                                <Card.Link className="small text-end">Esqueceu a senha?</Card.Link>
                                            </div>
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="w-100">Entrar</Button>
                                        {
                                            error ? <div className='alert alert-danger mt-3 mb-0'>{error}</div> : <></>
                                        }
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </main>
        </>
    )
}