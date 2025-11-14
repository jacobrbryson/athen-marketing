# Copy everything from local public/ folder to the bucket

gsutil -m rsync -r public gs://assets-athena-app

# Deploy to App Engine

ng build --configuration production
gcloud app deploy
