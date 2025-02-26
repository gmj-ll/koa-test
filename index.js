const Koa = require('koa');
const dgram = require('dgram');
const app = new Koa();

// 目标设备的MAC地址
const MAC_ADDRESS = '50:EB:F6:9C:70:D4';
// 目标设备的IPv6地址和端口
const TARGET_HOST = 'homeremote.top';
const TARGET_PORT = 1234;

// 创建UDP客户端
const client = dgram.createSocket('udp6');

// 生成WoL魔术包
function createMagicPacket(mac) {
  const macBytes = mac.split(':').map(hex => parseInt(hex, 16));
  const packet = Buffer.alloc(102);

  // 填充前6字节为0xFF
  for (let i = 0; i < 6; i++) {
    packet[i] = 0xFF;
  }

  // 重复MAC地址16次
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 6; j++) {
      packet[6 + i * 6 + j] = macBytes[j];
    }
  }

  return packet;
}

// Koa中间件：处理WoL请求
app.use(async (ctx) => {
  if (ctx.path === '/wake') {
    const magicPacket = createMagicPacket(MAC_ADDRESS);

    // 发送魔术包
    client.send(magicPacket, 0, magicPacket.length, TARGET_PORT, TARGET_HOST, (err) => {
      if (err) {
        console.error('Failed to send magic packet:', err);
        ctx.status = 500;
        ctx.body = 'Failed to send magic packet';
      } else {
        console.log('Magic packet sent successfully');
        ctx.status = 200;
        ctx.body = 'Magic packet sent successfully';
      }
    });
  } else {
    ctx.status = 404;
    ctx.body = 'Not Found';
  }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
