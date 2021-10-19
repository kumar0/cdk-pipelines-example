import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import * as path from 'path';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';

import * as certmgr from '@aws-cdk/aws-certificatemanager';
/**
 * A stack for our simple Lambda-powered web service
 */
export class CdkpipelinesDemoStack extends Stack {
  /**
   * The URL of the API Gateway endpoint, for use in the integ tests
   */
  public readonly urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        zoneName: 'skill-metrics.com',
        hostedZoneId: 'Z09553452HTRP8VIY2Z70',
      }
    );
    //Get Certificate Details
    const arn =
      'arn:aws:acm:us-east-1:972796746293:certificate/02c6ba16-22f3-4453-a734-d4b60ed0d413';

    const certificate = certmgr.Certificate.fromCertificateArn(
      this,
      'Certificate',
      arn
    );
    // The Lambda function that contains the functionality
    const handler = new lambda.Function(this, 'Lambda', {
      functionName: 'HElloHarish',
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')),
    });

    // An API Gateway to make the Lambda web-accessible
    const gw = new apigw.LambdaRestApi(this, 'Gateway', {
      restApiName: 'API-NAME',
      // domainName: {
      //   certificate: certificate,
      //   domainName: 'myapi.skill-metrics.com',
      // },
      description: 'Endpoint for a simple Lambda-powered web service',
      handler,
    });
    // new route53.ARecord(this, 'AliasRecord', {
    //   zone: hostedZone,
    //   recordName: 'myapi.skill-metrics.com', // www
    //   target: route53.RecordTarget.fromAlias(new targets.ApiGateway(gw)),
    // });
    this.urlOutput = new CfnOutput(this, 'Url', {
      value: gw.url,
    });
  }
}
