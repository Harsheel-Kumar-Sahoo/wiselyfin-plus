type Res = {
  status: (code: number) => { json: (body: unknown) => void };
};

export default function handler(_req: unknown, res: Res) {
  res.status(200).json({
    message: "Hello from WiselyFin Plus",
    time: new Date().toISOString(),
  });
}