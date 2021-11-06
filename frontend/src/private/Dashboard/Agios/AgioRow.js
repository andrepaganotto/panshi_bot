import React, { useState, useEffect, useMemo } from "react";

function AgioRow(props) {
    const [data, setData] = useState({
        crypto: '',
        agio: ''
    });

    const agioMemo = useMemo(() => (
        <li className='d-flex justify-content-between align-items-center ps-3  border-bottom'>
            <div className='d-flex align-items-center'>
                <div>
                    <img width='24' height='24' src={`./img/crypto-icons/${data.crypto ? data.crypto.toLowerCase() : 'btc'}.svg`} />
                </div>
                <div className='ms-2'>
                    <h6 className='mb-0'>{data.crypto}</h6>
                </div>
            </div>
            <div>
                <div className='d-flex align-items-center me-4 fw-bold'>
                    <h6 className={`mb-0 ${parseFloat(data.agio) < 1.00 ? 'text-danger' : 'text-success'}`}>{!data.agio ? 'Carregando' : data.agio.toFixed(2)}</h6>
                </div>
            </div>
        </li>
    ), [data.agio]);

    useEffect(() => {
        if(!props.data) return;

        if(data.crypto !== props.data.crypto) data.crypto = props.data.crypto;
        if(data.agio !== props.data.agio) data.agio = props.data.agio;

        setData(data);
    }, [props.data]);

    return (agioMemo);
};

export default AgioRow;