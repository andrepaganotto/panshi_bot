import React, { useState } from 'react';
import { Card, Col, Row } from '@themesberg/react-bootstrap';

// import { SalesValueWidget, SalesValueWidgetPhone } from "../../components/volt/Widgets";
import useWebSocket from 'react-use-websocket';
import Menu from '../../components/Menu';
import Agios from './Agios/Agios.js';
import Wallet from './Wallet';

function Dashboard() {
    const [agioList, setAgioList] = useState({});
    const [balance, setBalance] = useState({});
    const [error, setError] = useState('');

    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_WS_URL, {
        onOpen: () => console.log('Connected to WebSocket server'),
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.agios) setAgioList(lastJsonMessage.agios);
                if (lastJsonMessage.balance) setBalance(lastJsonMessage.balance);
                console.log(lastJsonMessage);
            }
        },
        queryParams: { "token": localStorage.getItem('token') },
        onError: (err) => console.error(err),
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    })

    return (
        <>
            <Menu />
            <main className='content'>
                <Row className="d-flex justify-content-end flex-row-reverse">
                    <Col xs={12} md={8} xl={9} className="mb-4 mt-3 d-xs-none d-sm-block">
                        <Wallet balance={balance} />
                        {/* <SalesValueWidget
                            title="Lucro"
                            value="10,567"
                            percentage={10.57}
                        /> */}
                    </Col>

                    <Col xs={12} md={4} xl={3} className='mt-3'>
                        <Agios agioList={agioList} />
                    </Col>

                </Row>
            </main>
        </>
    )
}

export default Dashboard;