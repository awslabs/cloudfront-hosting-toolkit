import path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';

/**
 * Interface for the Sharp layer.
 */
export class SDKLayer {

  /**
   * @param scope the construct scope.
   * @param id the construct identifier.
   * @returns a lambda layer version for the Sharp library
   * compiled for ARM64.
   */
  static arm64(scope: Construct, id: string): lambda.LayerVersion {
    const runtime = lambda.Runtime.NODEJS_18_X;
    const architecture = lambda.Architecture.ARM_64;

    // Builds the Sharp library for the target architecture
    // and outputs the result in the /asset-output directory.
    const layerAsset = new s3assets.Asset(scope, `Asset-${id}`, {
      path: path.join(__dirname),
      bundling: {
        image: runtime.bundlingImage,
        platform: architecture.dockerPlatform,
        command: [
          '/bin/bash',
          '-c',
          'npm install --prefix=/asset-output/nodejs @aws-sdk/client-cloudfront-keyvaluestore'          
        ],
        outputType: cdk.BundlingOutput.AUTO_DISCOVER,
        network: 'host',
        user: 'root'
      }
    });

    return (new lambda.LayerVersion(scope, id, {
      description: 'Provides a lambda layer for the AWS SDK library.',
      code: lambda.Code.fromBucket(
        layerAsset.bucket,
        layerAsset.s3ObjectKey
      ),
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_18_X
      ],
      compatibleArchitectures: [
        lambda.Architecture.ARM_64
      ]
    }));
  }
}