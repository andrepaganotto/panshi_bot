import { Dropdown, Form } from '@themesberg/react-bootstrap';
import React, { useState, useMemo } from 'react';

export default function SelectSymbol({ symbols, selected, value, onChange, disabled }) {
    const [query, setQuery] = useState('');
    const [show, setShow] = useState(false);

    function filter(symbols) {
        return symbols.filter(s => `${s.symbol.toLowerCase()}${s.name.toLowerCase()}`.indexOf(query.toLowerCase()) > -1);
    }

    function onToggleHandler(isOpen, e, metadata) {
        if (metadata.source != 'select') {
            setShow(isOpen);
        }
    }

    const symbolMemo = useMemo(() => (
        <Form.Group className='d-flex align-items-center justify-content-center mb-3'>
            <Form.Label className='mb-0 me-2 fw-bolder'>Crypto</Form.Label>
            {
                disabled ?
                    <Dropdown.Toggle as='div'>
                        <div className='d-flex justify-content-start align-items-center px-2 control-disabled'>
                            <div className='d-flex align-items-center'>
                                <img width='26' height='26' src={`./img/crypto-icons/${selected.symbol.toLowerCase()}.svg`} />
                            </div>
                            <div className='d-flex flex-column ms-2 p-0'>
                                <h6 className='m-0 crypto-label'>{selected.symbol}</h6>
                                <h6 className='m-0 crypto-name'>{selected.name}</h6>
                            </div>
                        </div>
                    </Dropdown.Toggle>
                    :
                    <Dropdown show={show} onToggle={(isOpen, e, metadata) => onToggleHandler(isOpen, e, metadata)}>

                        <Dropdown.Toggle as='div'>
                            <a className='d-flex justify-content-start align-items-center px-2 control'>
                                <div className='d-flex align-items-center'>
                                    <img width='26' height='26' src={`./img/crypto-icons/${selected.symbol.toLowerCase()}.svg`} />
                                </div>
                                <div className='d-flex flex-column ms-2 crypto-info p-0'>
                                    <h6 className='m-0 crypto-label'>{selected.symbol}</h6>
                                    <h6 className='m-0 crypto-name'>{selected.name}</h6>
                                </div>
                            </a>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className='symbols mt-1'>

                            <Dropdown.Item className='d-flex justify-content-center align-items-center'>
                                <Form.Control
                                    type='text'
                                    size='sm'
                                    onChange={e => setQuery(e.target.value)}
                                    onFocus={e => { if (e.target.value) e.target.value = '' }}
                                    autoFocus
                                    style={{ "width": '100px', borderRadius: '7px', borderWidth: '2px', textAlign: 'right' }}
                                />
                            </Dropdown.Item>

                            <Dropdown.Divider />

                            {filter(symbols).map(s =>
                                <Dropdown.Item
                                    key={s.symbol}
                                    onClick={() => { setQuery(''); onChange({ target: { id: 'symbol', value: s } }); setShow(!show); }}
                                    active={value === s}
                                >
                                    <div className='d-flex justify-content-start align-items-center'>
                                        <div className='d-flex align-items-center'>
                                            <img width='24' height='24' src={`./img/crypto-icons/${s.symbol ? s.symbol.toLowerCase() : 'btc'}.svg`} />
                                        </div>
                                        <div className='d-flex flex-column ms-2 crypto-info p-0'>
                                            <h6 className='m-0 crypto-label'>{s.symbol}</h6>
                                            <h6 className='m-0 crypto-name'>{s.name}</h6>
                                        </div>
                                    </div>
                                </Dropdown.Item>)}

                        </Dropdown.Menu>

                    </Dropdown>
            }
        </Form.Group>
    ), [selected, show, query]);

    return symbolMemo;
}