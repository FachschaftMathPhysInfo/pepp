import { OTLPHttpProtoTraceExporter, registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "pepp-frontend",
    traceExporter: new OTLPHttpProtoTraceExporter({
      url: 'http://otel-collector:4317'
    })
  });
}
