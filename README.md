# SnowPro Services

Snow Plow Business - Full Azure Project Plan

Cloud Infrastructure Engineer Portfolio Project | AZ-204 Exam Prep

## Project Overview

SnowPro Services is a ghost (fictional) snow plow business used as a hands-on Azure learning environment. The goal is to simulate a real production web application — complete with a customer-facing Next.js website, a serverless backend, role-based authentication, event-driven notifications, and full observability — while building every Azure skill tested on the AZ-204 exam.

This project is structured into 5 progressive phases. Each phase delivers a working milestone AND maps directly to AZ-204 exam domains so studying and building happen simultaneously.

## Your Role

Job Title: Azure Developer / Cloud Infrastructure Engineer (Independent Project)

You will wear three hats throughout this project:

- Azure Developer — Build and deploy all application code and Azure services
- Cloud Engineer — Design and manage the full Azure infrastructure
- Simulated Business Owner — Act as customer, employee, and admin to test real workflows end to end

## Phase Overview

| Phase   | Name                              | Duration  | AZ-104 Domains Covered                                                     |
| ------- | --------------------------------- | --------- | -------------------------------------------------------------------------- |
| Phase 1 | Frontend & Static Hosting         | 2-3 weeks | Azure Static Web Apps, Blob Storage, Resource Groups                       |
| Phase 2 | Networking & Custom Domain        | 2 weeks   | Azure DNS, Front Door, CDN, SSL/TLS                                        |
| Phase 3 | Serverless Backend & Storage      | 3-4 weeks | Azure Functions, Cosmos DB, Blob Storage SDK, Key Vault, Managed Identity  |
| Phase 4 | Security, Auth & API Management   | 2-3 weeks | Entra ID (Azure AD B2C), Managed Identity, Key Vault, Azure API Management |
| Phase 5 | Events, Messaging & Observability | 2 weeks   | Event Grid, Service Bus, Application Insights, Azure Monitor               |

## Phase 1 - Frontend & Static Hosting

DURATION: 2-3 WEEKS | GOAL: STATIC WEB APPS, BLOB STORAGE, RESOURCE GROUPS

### What You'll Build

- Next.js frontend deployed to Azure Static Web Apps (Standard tier for API route support)
- Azure Blob Storage account for storing job site photos and before/after images
- Resource Group (rg-snowpro-prod) to organize all project resources
- GitHub Actions CI/CD pipeline — push to main triggers automatic deployment

### AZ-204 Skills Practiced

- Create and configure Azure App Service Web Apps (Static Web Apps uses App Service infrastructure)
- Deploy code to Azure using GitHub Actions and Azure deployment tokens
- Configure and manage Azure Blob Storage accounts, containers, and access tiers
- Set and retrieve blob properties and metadata using the Azure SDK
- Implement storage lifecycle management policies

### Deliverable

Live Next.js site at a temporary Azure URL with GitHub Actions deploying on every push. Blob Storage account provisioned and ready for Phase 3.

## Phase 2 — Networking & Custom Domain

DURATION: 2 WEEKS | GOAL: TLS CONFIGURATION, API SETTINGS, SERVICE CONNECTIONS

### What You'll Build

- Register snowproservices.ca and set up Azure DNS Zone with A/CNAME records
- Deploy Azure Front Door (Standard tier) — SSL termination, WAF, global CDN routing
- Configure custom domain and managed HTTPS certificate on Static Web Apps
- Add Resend domain DNS verification records at the same time (unblocks email in Phase 3)

### AZ-204 Skills Practiced

- Configure TLS/SSL settings and service connections on Azure App Service
- Understand Azure networking concepts relevant to application deployment
- Configure API settings and custom domains on deployed web applications

### Deliverable

Site live at snowproservices.ca with HTTPS, WAF protection, and global CDN. Resend domain verified — ready to send emails from your real domain in Phase 3.
