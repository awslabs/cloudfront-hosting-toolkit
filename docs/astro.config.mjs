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
						{ "label": "CDK Integration", "link": "/user-guide/cdk-integration" }
					]
					},
					{
					"label": "Features",
					"items": [
						{ "label": "Overview", "link": "/features/overview" },
						{ "label": "Self-paced Setup Wizard", "link": "/features/setup-wizard" },
						{ "label": "Instant Deployment", "link": "/features/instant-deployment" },
						{ "label": "GitHub Integration", "link": "/features/github-integration" },
						{ "label": "Optimized Caching", "link": "/features/optimized-caching" },
						{ "label": "Enhanced Security Headers", "link": "/features/security-headers" },
						{ "label": "Custom Domain Support", "link": "/features/custom-domains" },
						{ "label": "SSL/TLS Management", "link": "/features/ssl-tls-management" }
					]
					},
					{
					"label": "Advanced Usage",
					"items": [
						{ "label": "Advanced Configuration", "link": "/advanced/configuration" },
						{ "label": "Custom Frameworks", "link": "/advanced/custom-frameworks" },
						{ "label": "Bring Your Own Framework", "link": "/advanced/bring-your-own-framework" },
						{ "label": "Manual Deployment", "link": "/advanced/manual-deployment" }
					]
					},
					{
					"label": "Troubleshooting",
					"items": [
						{ "label": "Troubleshooting Guide", "link": "/troubleshooting/guide" }
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
