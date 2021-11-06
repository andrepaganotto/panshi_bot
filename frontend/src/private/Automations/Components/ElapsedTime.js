import React, { useState, useEffect } from 'react';

export default function ElapsedTime({ startAt, endAt }) {
    const [elapsedTime, setElapsedTime] = useState('');

    function getElapsedTime() {
        let diff = endAt ? (Date.parse(endAt) - Date.parse(startAt)) / 1000 : (Date.now() - Date.parse(startAt)) / 1000;

        const seconds = Math.floor(diff % 60);
        const secondsStr = seconds < 10 ? '0' + seconds : seconds;

        diff /= 60;
        const minutes = Math.floor(diff % 60);
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        diff /= 60;
        const hours = Math.floor(diff % 24);
        const hoursStr = hours < 10 ? '0' + hours : hours;

        const days = Math.floor(diff / 24);

        return `${days > 0 ? days + 'd' : ''} ${hoursStr}:${minutesStr}:${secondsStr}`;
    }

    useEffect(() => { !endAt ? setInterval(() => setElapsedTime(getElapsedTime()), 1000) : setElapsedTime(getElapsedTime()) }, []);

    return (<>{elapsedTime || '...'}</>)
}

