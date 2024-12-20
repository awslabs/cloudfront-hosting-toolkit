/*
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

import {
  Aws,
  Duration,
  ArnFormat,
  aws_cloudfront as cloudfront,
  aws_s3 as s3,
  aws_cloudfront_origins as origins,
  aws_certificatemanager as acm,
  aws_ssm as ssm,
  CfnOutput,
  Stack,
} from "aws-cdk-lib";

import { CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { CfnBucketPolicy, IBucket } from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";

import { Construct } from "constructs";
import { calculateMainStackName, getDomainNames } from "../bin/cli/utils/helper";
import { addCfnSuppressRules } from "./cfn_nag/cfn_nag_utils";
import { HostingConfiguration } from "../bin/cli/shared/types";
import { SSM_DOMAIN_STR } from "../bin/cli/shared/constants";
import { truncateString } from "./utility";

interface IConfigProps {
  changeUri: cloudfront.Function;
  certificateArn?: string;
  hostingConfiguration: HostingConfiguration;
}



export class HostingInfrastructure extends Construct {
  
  public readonly hostingBucket: IBucket;
  public readonly distribution: cloudfront.Distribution;



  constructor(scope: Construct, id: string, params: IConfigProps) {
    super(scope, id);

    let s3Logs;
    /*
    //TODO add condition to activate logs
    s3Logs = new s3.Bucket(this, "LogsBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      enforceSSL: true,
    });

    addCfnSuppressRules(s3Logs, [
      {
        id: "W35",
        reason: "It is a log bucket, not need to have access logging enabled.",
      },
    ]);
    addCfnSuppressRules(s3Logs, [
      {
        id: "W51",
        reason: "It is a log bucket, not need for a bucket policy.",
      },
    ]);
    */
    this.hostingBucket = new s3.Bucket(this, "HostingBucket", {
      versioned: false,
      ...(s3Logs ? { serverAccessLogsBucket: s3Logs } : {}),
      enforceSSL: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicPolicy: true,
        blockPublicAcls: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      }),
    });


    const s3origin = origins.S3BucketOrigin.withOriginAccessControl(this.hostingBucket);

    const myResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      "ResponseHeadersPolicy",
      {
        responseHeadersPolicyName: "ResponseHeadersPolicy" + Stack.of(this).stackName + "-" + Stack.of(this).region,
        comment: "ResponseHeadersPolicy" + Stack.of(this).stackName + "-" + Stack.of(this).region,
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: false,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
          },
          xssProtection: { protection: true, modeBlock: true, override: true },
          
        },
        removeHeaders: ['age' , 'date'],
      }
    );

    const defaultCachePolicy = new cloudfront.CachePolicy(
      this,
      "DefaultCachePolicy",
      {
        cachePolicyName: "CachePolicy" + Stack.of(this).stackName + "-" + Stack.of(this).region,
        comment: "Default policy - " + Stack.of(this).stackName + "-" + Stack.of(this).region,
        defaultTtl: Duration.days(365),
        minTtl: Duration.days(365),
        maxTtl: Duration.days(365),
        cookieBehavior: cloudfront.CacheCookieBehavior.none(),
        headerBehavior: cloudfront.CacheHeaderBehavior.none(),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      }
    );

    const imgCachePolicy = new cloudfront.CachePolicy(this, "ImagesCachePolicy", {
      cachePolicyName: "ImagesCachePolicy" + Stack.of(this).stackName + "-" + Stack.of(this).region,
      comment: "Images cache policy - " + Stack.of(this).stackName + "-" + Stack.of(this).region,
      defaultTtl: Duration.days(365),
      minTtl: Duration.days(365),
      maxTtl: Duration.days(365),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    });

    const staticAssetsCachePolicy = new cloudfront.CachePolicy(this, "staticAssetsCachePolicy", {
      cachePolicyName: "StaticAssetsCachePolicy" + Stack.of(this).stackName + "-" + Stack.of(this).region,
      comment: "Static assets cache policy - " + Stack.of(this).stackName + "-" + Stack.of(this).region,
      defaultTtl: Duration.days(365),
      minTtl: Duration.days(365),
      maxTtl: Duration.days(365),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    });

    const defaultBehavior: cloudfront.BehaviorOptions = {
      origin: s3origin,
      responseHeadersPolicy: myResponseHeadersPolicy,
      cachePolicy: defaultCachePolicy,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: params.changeUri,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };

    const imgBehaviour: cloudfront.BehaviorOptions = {
      origin: s3origin,
      responseHeadersPolicy: myResponseHeadersPolicy,
      cachePolicy: imgCachePolicy,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: params.changeUri,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };

    const staticAssetsBehaviour: cloudfront.BehaviorOptions = {
      origin: s3origin,
      compress: true,
      responseHeadersPolicy: myResponseHeadersPolicy,
      cachePolicy: staticAssetsCachePolicy,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: params.changeUri,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };


    let cfLogs;
    /*
    //TODO add condition to activate logs
    cfLogs = new s3.Bucket(this, "CloudfrontLogsBucket", {
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });

    NagSuppressions.addResourceSuppressions(cfLogs, [
      {
        id: "AwsSolutions-S1",
        reason: "It is a log bucket, not need to have access logging enabled.",
      },
    ]);

    addCfnSuppressRules(cfLogs, [
      {
        id: "W35",
        reason: "It is a log bucket, not need to have access logging enabled.",
      },
    ]);
    addCfnSuppressRules(cfLogs, [
      {
        id: "W51",
        reason: "It is a log bucket, not need for a bucket policy.",
      },
    ]);*/



    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: "Static hosting - " + Stack.of(this).stackName,
      defaultRootObject: "index.html",
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      ...(cfLogs ? { enableLogging: true } : {}),
      ...(cfLogs ? { logBucket: cfLogs } : {}),
      ...(cfLogs ? { logFilePrefix: "distribution-access-logs/" } : {}),
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: defaultBehavior,
      additionalBehaviors: {
        "*.jpg": imgBehaviour,
        "*.jpeg": imgBehaviour,
        "*.png": imgBehaviour,
        "*.gif": imgBehaviour,
        "*.bmp": imgBehaviour,
        "*.tiff": imgBehaviour,
        "*.ico": imgBehaviour,
        "*.js": staticAssetsBehaviour,
        "*.css": staticAssetsBehaviour,
        "*.html": staticAssetsBehaviour,
      },
      ...(params.hostingConfiguration.domainName && params.certificateArn
        ? {
            domainNames: getDomainNames(params.hostingConfiguration.domainName),
            certificate: acm.Certificate.fromCertificateArn(
              this,
              "Certificate",
              params.certificateArn
            ),
          }
        : {}),
    });

    NagSuppressions.addResourceSuppressions(this.distribution, [
      {
        id: "AwsSolutions-CFR4",
        reason:
          "A certificate with min TLS 1.2 is selected if the user has a custom domain",
      },
    ]);



    new CfnOutput(this, "DomainName", {
      value: "https://" + this.distribution.domainName,
    });

    const stackName = calculateMainStackName(params.hostingConfiguration);


    new ssm.StringParameter(this, 'SSMConnectionRegion', {
      parameterName: '/' + stackName + '/' + SSM_DOMAIN_STR, 
      stringValue: this.distribution.domainName,
    });


  }
}
