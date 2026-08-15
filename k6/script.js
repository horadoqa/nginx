import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1000 },  // Sobe até 10 VUs
    { duration: '1m', target: 1000 },   // Mantém 10 VUs
    { duration: '30s', target: 5000 },  // Sobe até 50 VUs
    { duration: '1m', target: 5000 },   // Mantém 50 VUs
    { duration: '30s', target: 0 },   // Encerra gradualmente
  ],
};

export default function () {
  const res = http.get('https://serratec.org/');

  check(res, {
    'status é 200': (r) => r.status === 200,
    'resposta menor que 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}