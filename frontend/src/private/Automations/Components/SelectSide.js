import React, { useMemo } from 'react';
import { Form } from '@themesberg/react-bootstrap';

export default function SelectSide({ onChange, side, disabled }) {

    const sideMemo = useMemo(() => (
        <Form.Group className='d-flex align-items-center justify-content-between'>
            {/* {console.log('Rendering select-side')} */}
            <Form.Label className='mb-0 fw-bolder d-flex flex-column justify-content-center align-items-center select-side-title'>
                Tipo
                <small className='m-0 fw-light fst-italic select-side-type'>{`(${side ? 'vender' : 'comprar'})`}</small>
            </Form.Label>
            <div className='d-flex align-items-center justify-content-center'>
                <Form.Switch
                    id='side'
                    type='checkbox'
                    checked={side}
                    disabled={disabled}
                    onChange={e => onChange({ target: { id: e.target.id, value: side ? 'SELL' : 'BUY' } })}
                />
            </div>
        </Form.Group >
    ), [side]);

    return sideMemo;
}