import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE,
	base: '/cloudfront-hosting-toolkit',
	markdown: {
		gfm: true
  },
	integrations: [
		starlight({
			title: 'Cloudfront Hosting Toolkit',
			description: 'open source command line tool to help developers deploy fast and secure frontends in the cloud 🤖🚀',
			defaultLocale: 'en',
			favicon: '/src/assets/favicon.ico',
			customCss: [
				'./src/styles/landing.css',
				'./src/styles/font.css',
				'./src/styles/custom.css',
				'./src/styles/terminal.css'
			],
			social: {
				github: 'https://github.com/awslabs/cloudfront-hosting-toolkit'
			},
			"sidebar": [
					{
					"label": "Getting Started",
					"items": [
						{ "label": "Introduction", "link": "/getting-started/introduction" },
						{ "label": "Quickstart", "link": "/getting-started/quickstart" },
						{ "label": "How It Works", "link": "/getting-started/how-it-works" }
					]
					},
					{
					"label": "Architecture",
					"items": [
						{ "label": "Overview", "link": "/architecture/overview" },
						{ "label": "GitHub Workflow", "link": "/architecture/github-workflow" },
						{ "label": "S3 Workflow", "link": "/architecture/s3-workflow" }
					]
					},
					{
					"label": "User Guide",
					"items": [
						{ "label": "CLI Guide", "link": "/user-guide/cli-guide" },
						{
							label: 'CDK Guide',
							items: [
								{ label: 'Overview', link: '/user-guide/cdk-guide' },
								{ label: 'CDK Construct', link: '/user-guide/cdk-construct' },
								{ label: 'CDK Source code', link: '/user-guide/cdk-source-code' },
								{ label: 'Configuration guide', link: '/user-guide/cdk-configuration' },
							]
						},	
					]
					},
					{
					"label": "Features",
					"items": [
						{ "label": "Overview", "link": "/features/overview" },
						{ "label": "Self-paced wizard", "link": "/features/setup-wizard" },
						{ "label": "Instant deployment", "link": "/features/instant-deployment" },
						{ "label": "GitHub integration", "link": "/features/github-integration" },
						{ "label": "Optimized caching", "link": "/features/optimized-caching" },
						{ "label": "Security headers", "link": "/features/security-headers" },
						{ "label": "Custom domain support", "link": "/features/custom-domains" }
					]
					},
					{
					"label": "Advanced Usage",
					"items": [
						{ "label": "Advanced configuration", "link": "/advanced/configuration" },
						{ "label": "Bring your own framework", "link": "/advanced/bring-your-own-framework" }
					]
					},
					{
					"label": "Troubleshooting",
					"items": [
						{ "label": "Troubleshooting guide", "link": "/troubleshooting/guide" }
					]
					},
					{
					"label": "Project Info",
					"items": [
						{ "label": "FAQ", "link": "/project/faq" },
					]
					}
				]

			})
	]
});
