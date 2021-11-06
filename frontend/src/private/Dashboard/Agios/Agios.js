import React from "react";
import { Row, Card } from '@themesberg/react-bootstrap';
import AgioRow from "./AgioRow";
import './scroll.css';

function Agios(props) {
    const agios = props.agioList;

    return (
        <Card border="light" className="shadow-sm mb-3">
            <Row>
                <Card.Title className='d-flex justify-content-center align-items-center pt-3'>
                    <h5 className='mb-0'>Agios</h5>
                </Card.Title>
                <ul className='table containHeight'>
                    {
                        agios.length ?
                            agios.map(agio => <AgioRow key={`${agio.crypto}`} data={agio} />) :
                            <div className='d-flex justify-content-center mb-3'>
                                <h6 className='mb-0'>Carregando...</h6>
                            </div>
                    }
                </ul>
            </Row>
        </Card>
    );
};

export default Agios;