import React from 'react';

interface Props {
    color?: string;
    size?: number | string;
}

export const Pawn: React.FC<Props> = ({ color = "currentColor", size = "75%" }) => (
    <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" fill={color} width={size} height={size}>
        <path d="m 83.58,87.46 c 0,-25.408 20.37,-46 45.5,-46 25.14,0 45.5,20.592 45.5,46 0,25.408 -20.36,46 -45.5,46 -25.13,0 -45.5,-20.592 -45.5,-46 z m -17,137 23.2,-61.001 h 78.6 l 23.2,61.001 z" fillRule="evenodd" />
    </svg>
);
