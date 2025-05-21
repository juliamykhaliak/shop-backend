import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import csvParser from "csv-parser";

const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event: any) => {
  try {
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const objectKey = record.s3.object.key;

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      const response = await s3.send(command);
      const stream = response.Body as Readable;

      console.log(`Processing file: ${objectKey}`);
      stream
        .pipe(csvParser())
        .on("data", (data) => {
          console.log("Record:", data);
        })
        .on("end", () => {
          console.log(`Finished processing file: ${objectKey}`);
        });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File processed successfully" }),
    };
  } catch (error: any) {
    console.error("Error processing file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to process file", error: error.message }),
    };
  }
};