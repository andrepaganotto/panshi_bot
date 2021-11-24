import React, { useMemo } from 'react';
import { Form } from '@themesberg/react-bootstrap';

export default function LoopOperations({ onChange, loop }) {
    const loopMemo = useMemo(() => (
        <>
            <Form.Label className='mb-0 me-2 fw-bolder'>Repetir</Form.Label>
            <Form.Check
                id='loop'
                checked={loop}
                onChange={e => onChange(e)}
            />
        </>
    ), [loop])

    return loopMemo;
}