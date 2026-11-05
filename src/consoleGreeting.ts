const banner = String.raw`
 _____ ____  _____ ____     _       _
|  ___|  _ \|  ___/ ___|___| |_   _| |__
| |_  | | | | |_  \___ \/ __| | | | | '_ \
|  _| | |_| |  _|  ___) | (__| | |_| | |_) |
|_|   |____/|_|   |____/ \___|_|\__,_|_.__/
`

export function showConsoleGreeting() {
  console.log(
    `%c${banner}%c\nTickets open. You hear first.\n\n%cPeeking under the hood? FDFSClub is open source.\nContribute on GitHub:\n  Frontend: https://github.com/sai-sahith7/fdfsclub-frontend\n  Backend:  https://github.com/sai-sahith7/fdfsclub-backend`,
    'color:#e8c97d;font-family:monospace;font-weight:bold',
    'color:#e0e0e0;font-size:13px;font-weight:bold',
    'color:#a0a0a0;font-size:12px',
  )
}
