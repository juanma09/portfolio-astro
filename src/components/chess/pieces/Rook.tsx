import React from 'react';

interface Props {
    color?: string;
    size?: number | string;
}

export const Rook: React.FC<Props> = ({ color = "currentColor", size = "75%" }) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill={color} width={size} height={size}>
        <g transform="translate(15, 15)">
            <path d="m 14,209 15.11,-96 h 112.78 l 15.11,96 z" fillRule="evenodd" />
            <path d="m 0,0 h 44.08 v 42.32 h 20.71 V 0 h 41.42 v 42.32 h 20.71 V 0 H 171 v 96 h -171 z" fillRule="evenodd" />
        </g>
    </svg>
);
