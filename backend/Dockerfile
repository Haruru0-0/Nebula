# Nebula API as a Lambda container image. The Lambda Web Adapter lets the normal Express server run unchanged:
# it forwards each Lambda request to the app on port 8080 and streams the response back (chat replies stream).
#
# The app is compiled and its production packages installed on your machine first (scripts/deploy-lambda.mjs does
# this into .lambda-build/), then copied in here. Installing packages inside Docker stalled on some networks.
FROM node:22-slim
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.1.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV NODE_ENV=production \
    PORT=8080 \
    AWS_LWA_PORT=8080 \
    AWS_LWA_INVOKE_MODE=response_stream \
    AWS_LWA_READINESS_CHECK_PATH=/health
WORKDIR /app
COPY .lambda-build/ ./
CMD ["node", "dist/server.js"]
