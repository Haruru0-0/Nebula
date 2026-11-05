# Deploy the API to AWS Lambda

The Express app runs unchanged in a Lambda container image through the Lambda Web Adapter, behind a public Function URL
with response streaming (chat replies stream). Live metrics use the page's 15-second refresh instead of Socket.io.

## One time
1. AWS account, a budget alert, an IAM user with access keys, then `aws configure` (region `us-east-2`).
2. `winget install Amazon.AWSCLI` and `winget install Amazon.SAM-CLI`, then open a new terminal.
3. Docker Desktop running.

## Deploy
```bash
cd backend
node scripts/deploy-lambda.mjs --client-url https://YOUR-FRONTEND.vercel.app
```
The script compiles the app and installs production packages into `.lambda-build/`, builds the image with SAM, and
deploys the `nebula-api` stack. Secrets are read from `backend/.env` on your machine and passed to SAM as parameters;
nothing is printed or saved. The AI provider keys are not sent, so every user adds their own.

The last lines print `ApiUrl`. Use it on Vercel:
- `BACKEND_URL` = ApiUrl without the trailing slash
- `NEXT_PUBLIC_DIRECT_API_URL` = ApiUrl without the trailing slash, plus `/api`
- `NEXT_PUBLIC_LIVE_METRICS` = `off`

First deploy: use `--client-url http://localhost:3000`, deploy the frontend, then run the script again with the real
Vercel address (it only changes two environment variables, so the second run is quick).

## Notes
- Cold starts take about a second. Idle costs nothing. The free allowance is shared by all your functions.
- The image sits in ECR (about 0.4 GB, a few cents a month). Delete the stack with `sam delete --stack-name nebula-api --region us-east-2`.
- The in-memory rate limiter and model cache are per instance on Lambda, so they are loose. Fine for a portfolio.
- Logs go to CloudWatch (`LOG_TO_FILES=0`).
