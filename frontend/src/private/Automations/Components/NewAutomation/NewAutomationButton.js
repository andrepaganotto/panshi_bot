import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function NewAutomationButton({ onClick }) {
    return (
        <div onClick={onClick} className='theme-settings theme-settings-expand card bg-secondary btn-secondary'>
            <div className='p-3 py-2 card-body'>
                <span>
                    <FontAwesomeIcon className='m=0' icon={faPlus} />
                </span>
            </div>
        </div>
    )
}