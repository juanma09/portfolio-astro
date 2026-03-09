import React from 'react';

interface Props {
    color?: string;
    size?: number | string;
}

export const Queen: React.FC<Props> = ({ color = "currentColor", size = "75%" }) => (
    <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" fill={color} width={size} height={size}>
        <path d="m 130,33 c 0,0.004 0,0.008 0.01,0.012 l 41.8,88.436 58.19,-72.328 v 0 0 L 209.75,232 h -159.5 L 30,49.12 v 0 0 l 0.1,0.124 58.09,72.204 z" fillRule="evenodd" />
    </svg>
);
