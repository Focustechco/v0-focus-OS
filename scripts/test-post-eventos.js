import http from 'http'

const data = JSON.stringify({
  titulo: "Teste",
  data: "2026-04-22",
  hora_inicio: "10:00",
  duracao_minutos: 60,
  tipo: "reuniao"
})

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/eventos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, res => {
  let body = ''
  res.on('data', d => body += d)
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body))
})

req.on('error', error => console.error(error))
req.write(data)
req.end()
