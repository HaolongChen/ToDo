export const Bell = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 48 48">
            <g fill="none">
                <path fill="url(#fluentColorAlert480)" d="M29.993 38a6 6 0 1 1-12 0a6 6 0 0 1 12 0"></path>
                <path fill="url(#fluentColorAlert481)" d="M24 4C15.716 4 9 10.716 9 19v8.487l-2.804 6.355A2.25 2.25 0 0 0 8.254 37h31.492a2.25 2.25 0 0 0 2.058-3.158L39 27.487V19c0-8.284-6.716-15-15-15"></path>
                <defs>
                    <linearGradient id="fluentColorAlert480" x1={23.993} x2={24.032} y1={36.286} y2={43.999} gradientUnits="userSpaceOnUse">
                        <stop stopColor="#eb4824"></stop>
                        <stop offset={1} stopColor="#ffcd0f" stopOpacity={0.988}></stop>
                    </linearGradient>
                    <linearGradient id="fluentColorAlert481" x1={37.487} x2={10.226} y1={33.333} y2={8.7} gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ff6f47"></stop>
                        <stop offset={1} stopColor="#ffcd0f"></stop>
                    </linearGradient>
                </defs>
            </g>
        </svg>
    );
}