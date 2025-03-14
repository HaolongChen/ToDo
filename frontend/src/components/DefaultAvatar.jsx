export function DefaultAvatar({ size = 32 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
        <g fill="none">
            <path fill="#212121" d="M7.5 18A3.5 3.5 0 0 0 4 21.5v.5c0 2.393 1.523 4.417 3.685 5.793C9.859 29.177 12.802 30 16 30s6.14-.823 8.315-2.206C26.477 26.418 28 24.394 28 22v-.5a3.5 3.5 0 0 0-3.5-3.5z"></path>
            <path fill="url(#fluentColorPerson320)" d="M7.5 18A3.5 3.5 0 0 0 4 21.5v.5c0 2.393 1.523 4.417 3.685 5.793C9.859 29.177 12.802 30 16 30s6.14-.823 8.315-2.206C26.477 26.418 28 24.394 28 22v-.5a3.5 3.5 0 0 0-3.5-3.5z"></path>
            <path fill="url(#fluentColorPerson321)" d="M7.5 18A3.5 3.5 0 0 0 4 21.5v.5c0 2.393 1.523 4.417 3.685 5.793C9.859 29.177 12.802 30 16 30s6.14-.823 8.315-2.206C26.477 26.418 28 24.394 28 22v-.5a3.5 3.5 0 0 0-3.5-3.5z"></path>
            <path fill="#242424" d="M16 16a7 7 0 1 0 0-14a7 7 0 0 0 0 14"></path>
            <path fill="url(#fluentColorPerson322)" d="M16 16a7 7 0 1 0 0-14a7 7 0 0 0 0 14"></path>
            <defs>
                <linearGradient id="fluentColorPerson320" x1={9.707} x2={13.584} y1={19.595} y2={31.977} gradientUnits="userSpaceOnUse">
                    <stop offset={0.125} stopColor="#9c6cfe"></stop>
                    <stop offset={1} stopColor="#7a41dc"></stop>
                </linearGradient>
                <linearGradient id="fluentColorPerson321" x1={16} x2={21.429} y1={16.571} y2={36.857} gradientUnits="userSpaceOnUse">
                    <stop stopColor="#885edb" stopOpacity={0}></stop>
                    <stop offset={1} stopColor="#e362f8"></stop>
                </linearGradient>
                <linearGradient id="fluentColorPerson322" x1={12.329} x2={19.464} y1={3.861} y2={15.254} gradientUnits="userSpaceOnUse">
                    <stop offset={0.125} stopColor="#9c6cfe"></stop>
                    <stop offset={1} stopColor="#7a41dc"></stop>
                </linearGradient>
            </defs>
        </g>
    </svg>
  );
}