import { Form, OverlayTrigger, Tooltip } from '@themesberg/react-bootstrap';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const style = { width: '80px', borderRadius: '7px', borderWidth: '2px', textAlign: 'right' };

export default function FloatValues({ onChange, agio, vol, tol, selectedSymbol }) {
    const [minVol, setMinVol] = useState('');

    function replaceComma(e) {
        e.target.value = e.target.value.replace(',', '.');
        onChange(e);
    }

    useEffect(() => {
        axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedSymbol.symbol}USDT`)
            .then(resp => {
                setMinVol(parseFloat((11 / parseFloat(resp.data.price)).toFixed(selectedSymbol.precision)));
            })
            .catch(err => console.error(err))
    }, [selectedSymbol]);

    const floatMemo = useMemo(() => (
        <Form.Group id='float-values' className='d-flex flex-column justify-content-center align-items-end'>
            <OverlayTrigger
                placement="right"
                delay={{ show: 150, hide: 350 }}
                overlay={(props) => (
                    <Tooltip className='ms-2 p-0' id="button-tooltip" {...props}>
                        Vol. min.: {minVol} {selectedSymbol.symbol}
                    </Tooltip>
                )}
            >
                <Form.Group className='d-flex align-items-center mb-2'>
                    <Form.Label className='m-0 me-2 fw-bolder'>Volume:</Form.Label>
                    <Form.Control
                        id="vol"
                        onChange={e => replaceComma(e)}
                        onBlur={e => {
                            if (parseFloat(e.target.value) < parseFloat(minVol)) {
                                e.target.value = minVol;
                                onChange(e);
                            }
                        }}
                        value={vol}
                        pattern={`[0-9]*(?![0-9])[,.]?[0-9]{0,${selectedSymbol.precision}}`}
                        required size='sm' type="text" style={{ width: '100px', borderRadius: '7px', borderWidth: '2px', textAlign: 'right' }}
                        autoComplete='off' onKeyDown={e => { if (e.key == 'Enter') e.preventDefault() }}
                    />
                </Form.Group>
            </OverlayTrigger>


            <Form.Group className='d-flex align-items-center mb-2'>
                <Form.Label className='m-0 me-2 fw-bolder'>Agio:</Form.Label>
                <Form.Control
                    id='agio'
                    maxLength='4'
                    value={agio}
                    onChange={e => {
                        if (e.target.value[3] === ',' || e.target.value[3] === '.') e.target.value = e.target.value.replace(/[,.]/, '');
                        replaceComma(e)
                    }}
                    onBlur={e => {
                        if ((e.target.value[e.target.value.length - 1] === ',' && e.target.value.indexOf(',') !== 3)
                            || (e.target.value[e.target.value.length - 1] === '.' && e.target.value.indexOf('.') !== 3)) e.target.value = e.target.value.concat('0');
                        onChange(e);
                    }}
                    pattern={'[0-9]{1}(?![0-9])[,.]?[0-9]{0,2}'}
                    required size='sm' type="text" style={style} autoComplete='off' onKeyDown={e => { if (e.key == 'Enter') e.preventDefault() }}
                />
            </Form.Group>

            <OverlayTrigger
                placement="right"
                delay={{ show: 150, hide: 350 }}
                overlay={(props) => (
                    <Tooltip className='ms-2 p-0' id="button-tooltip" {...props}>
                        Min.: 0.3%
                    </Tooltip>
                )}
            >
                <Form.Group className='d-flex align-items-center'>
                    <Form.Label className='m-0 me-2 fw-bolder'>Offset:</Form.Label>
                    <Form.Control
                        id="tol"
                        maxLength='4'
                        onFocus={e => { e.target.value = e.target.value.replace('%', ''); onChange(e); }}
                        onChange={e => replaceComma(e)}
                        onBlur={e => {
                            if (parseFloat(e.target.value) < 0.3) e.target.value = 0.3;
                            e.target.value = e.target.value.length ? e.target.value.concat('%') : e.target.value;
                            onChange(e);
                        }}
                        value={tol}
                        pattern={'[0-9]{1}(?![0-9])[,.]?[0-9]{0,2}[%]?'}
                        size='sm' type="text" style={style} autoComplete='off' onKeyDown={e => { if (e.key == 'Enter') e.preventDefault() }}
                    />
                </Form.Group>
            </OverlayTrigger>

        </Form.Group>
    ), [agio, vol, tol, selectedSymbol, minVol]);

    return floatMemo;
}