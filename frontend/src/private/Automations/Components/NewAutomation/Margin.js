import React, { useMemo } from 'react';
import { Form } from '@themesberg/react-bootstrap';

export default function Margin({ onChange, margin, selectedSymbol, disabled }) {
    const marginMemo = useMemo(() => (
        <Form.Group className='d-flex align-items-center justify-content-center me-1'>
            <Form.Label className='mb-0 me-2 fw-bolder'>Margin</Form.Label>
            <Form.Check
                id='margin'
                checked={(selectedSymbol && !selectedSymbol.margin) ? false : margin}
                onChange={e => onChange({ target: { id: e.target.id, value: e.target.checked } })}
                disabled={disabled || (selectedSymbol ? !selectedSymbol.margin : true)}
            />
        </Form.Group >
    ), [margin, selectedSymbol])

    return marginMemo;
}