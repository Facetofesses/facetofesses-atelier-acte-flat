# Face to fesses - Atelier de l'acte
---

## Installation

Clone the projet

```bash
git clone git@github.com:quentinneyraud/facetofesses-atelier-acte.git
```

Install dependencies (Yarn or npm)

```bash
cd facetofesses-atelier-acte
yarn
```

## Getting started

```bash
npm run dev
```

Go to **localhost:8090/**

## Structure

#### Client

#### Server

Server is used to pass datas from tablet interactions to screen. Tablet and screen are identified by server with a socket message :

```javascript
{
	type: 'auth',
	datas: {
		device: 'screen' // or 'tablet'
	}
}
```

`Tablet` and `Screen` classes extends `SocketListener` which have methods to listen and send socket messages.

`SocketDispatcher` listen to all `connection` and `data` events to identify and link devices :

```javascript
Tablet.onSocketDatasReceived = (datas) => {
  Screen.emit('data', datas)
}
```

