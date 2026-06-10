<div align="center">

<img src="https://www.sju.edu.in/assets/img/st-joseph-university-logo.png" height="80" style="background:white; padding:8px; margin:0 16px;" />
<img src="https://www.erafoundationindia.org/images/logo.svg" height="80" style="background:white; padding:8px; margin:0 16px;" />
<img src="https://comedkares.org/wp-content/uploads/2023/04/Comedkares-Logo-EPS.png" height="80" style="background:white; padding:8px; margin:0 16px;" />

<br/><br/>

#  AI-Based Smart Product Assistance and Indoor Navigation System For Retail Stores

### *Transforming the In-Store Shopping Experience Through Artificial Intelligence*

<br/>

<br/>

**Rovan John, MSc BDA, 252BDA42 · Mareen Biju George, MSc BDA, 252BDA21 · A Carton Britto, MCA, 253MCA64 · G Jeswanth, MCA, 253MCA02 · Shaik Mohammad Farhanulla Sami, MCA, 253MCA52**

*St. Joseph's University, Bengaluru — Department of Computer Applications & Big Data Analytics*

</div>

---

<div align="center">

## 💡 Why This System Exists

> *"67.3% of customers who leave stores empty-handed do so because they cannot find the product they need, despite its availability on the shelves" (Retail TouchPoints, 2018).*
**Every unsatisfied customer is lost revenue. We fix that.**

</div>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Market Opportunity](#-market-opportunity)
- [Key Features](#-key-features)
- [System Demo Overview](#-system-demo-overview)
- [Abstract](#abstract)
- [Keywords](#keywords)
- [1. Introduction](#1-introduction)
- [2. Literature Review](#2-literature-review)
- [3. Problem Statement](#3-problem-statement)
- [4. Objectives](#4-objectives)
- [5. Methodology](#5-methodology)
- [6. Implementation](#6-implementation)
- [7. Results & Analysis](#7-results--analysis)
- [8. Discussion](#8-discussion)
- [9. Conclusion](#9-conclusion)
- [10. Future Scope](#10-future-scope)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Acknowledgements](#acknowledgements)
- [References](#references)

---

##  Executive Summary

The **AI-Based Smart Product Assistance and Indoor Navigation System** is a full-stack, production-ready intelligent retail solution that combines **Conversational AI**, **Indoor Store Navigation**, and **Product Recommendations** into one seamless customer-facing platform.

Built for supermarkets, hypermarkets, and large-format retail stores, this system allows shoppers to:
- **Find any product instantly** using natural language search
- **Navigate the store visually** through an AI-generated route on an interactive map
- **Receive product recommendations** powered by a Large Language Model
- **Interact via voice or text** for a completely hands-free experience

For store operators, the system delivers:
- **Reduced dependency on floor staff** for product location queries
- **Increased basket size** through intelligent cross-sell recommendations
- **Inventory-status checking** that avoids recommending products marked as unavailable


---

##  Market Opportunity

The global smart retail market represents one of the fastest-growing technology investment areas worldwide, with strong and consistent growth projections from multiple independent research firms.

> *"The global smart retail industry is expected to grow at a CAGR of 29.1% from 2024 to 2030."*
> — Grand View Research, 2024
##  Market Opportunity

The global smart retail market is projected to reach **USD 227.3 billion by 2030**, growing at a CAGR of **29.1%** *(Grand View Research, 2024)*.

| Market Insight | Data | Source |
|---|---|---|
| Customers who leave stores without finding their product | **67.3%** | Retail TouchPoints, 2018 |
| Customers who prefer self-service over asking staff | **81%** | Harvard Business Review |
| Revenue Amazon attributes to AI recommendations | **35%** | McKinsey / Barilliance |
| Revenue increase for AI personalisation leaders vs. competitors | **40% more** | McKinsey & Company, 2021 |
| Cost reduction through AI customer service automation | **Up to 30%** | VentureBeat / McKinsey |
| Smart retail market CAGR (2024–2030) | **29.1%** | Grand View Research, 2024 |
| Smart retail market projected size by 2030 | **USD 227.3 Billion** | Grand View Research, 2024 |

**Sources:** Retail TouchPoints (2018); Dixon et al., *The Effortless Experience*, HBR Press (2013); McKinsey & Company (2021), *The Value of Getting Personalisation Right*; Barilliance Research; VentureBeat; Grand View Research (2024), *Global Smart Retail Market Outlook 2030*.




---

##  Key Features

###  Interactive Indoor Store Navigation
A real-time, grid-based visual store map rendered directly in the browser. When a customer searches for a product, the system instantly plots the **shortest walking route** from their current position to the target shelf  highlighting aisles, turns, and destination with a clean visual overlay.

### AI-Powered Conversational Assistant
Powered by the **Anthropic Claude API**, the assistant understands natural language queries, asks intelligent follow-up questions, maintains full conversation context, and responds with human-like explanations of products, locations, and alternatives. No rigid command inputs just natural conversation.

###  Voice Assistant Integration
Customers can interact entirely hands-free. The voice module transcribes spoken queries in real time, routes them through the NLP pipeline, and responds with both spoken guidance and a visual route on the store map — making the system fully accessible.

###  Product Recommendations
A hybrid recommendation engine combining **Content-Based Filtering** and **Collaborative Filtering** analyses customer preferences, dietary constraints and budget to surface the most relevant products  not just what's in the aisle, but what's right for the customer.


###  Explainable Recommendations
Every product recommendation includes a transparent explanation: why it was chosen, how it matches the customer's stated preferences, its price relative to the customer's budget, and its current stock status. This builds customer trust and increases conversion.

###  Responsive Web Interface
The entire system runs in the browser — no app download required. Built with **React, TypeScript, and Vite**, the interface is fully responsive across desktop, tablet, and mobile devices, making it accessible to every customer the moment they enter the store.

---

##  System Demo Overview

```
Customer enters store and opens the web application on their phone.

 ┌─────────────────────────────────────────────────┐
 │  👤 Customer: "I need low-fat milk and oats"    │
 └─────────────────────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────┐
 │  🧠 NLP Engine extracts:                        │
 │     Products → [Low-fat Milk, Oats]             │
 │     Preferences → [Low-fat, Healthy]            │
 └─────────────────────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────┐
 │  📦 Inventory Check:                            │
 │     Amul Low-Fat Milk → In Stock (Aisle 2B)     │
 │     Kellogg's Oats    → In Stock (Aisle 4A)     │
 └─────────────────────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────┐
 │  🗺️ Navigation Engine:                          │
 │     Optimal route: Entrance → 2B → 4A           │
 │     Route rendered on interactive store map     │
 └─────────────────────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────┐
 │  🤖 Claude AI Response:                         │
 │  "Head straight to Aisle 2 on your right for    │
 │   Amul Low-Fat Milk (₹55, In Stock), then       │
 │   continue to Aisle 4 for Kellogg's Oats        │
 │   (₹180, In Stock). Both match your healthy     │
 │   preference and are within your budget."       │
 └─────────────────────────────────────────────────┘
```

---

## Abstract

The retail industry is rapidly adopting Artificial Intelligence (AI) technologies to improve customer experience and operational efficiency. This project proposes an AI-Based Smart Product Assistance and Indoor Navigation System designed for retail supermarkets. The system integrates Large Language Models (LLMs), Conversational Recommender Systems (CRS), and indoor navigation technologies to assist customers in locating products, navigating store aisles, and receiving  product recommendations , all through a single intelligent conversational interface.

By combining AI-driven assistance with real-time interactive store mapping, inventory-aware routing, and voice interaction capabilities, the proposed system fundamentally transforms the in-store shopping experience. Customers no longer need to seek manual assistance or wander through unfamiliar aisles; instead, they receive instant, accurate, and  guidance directly on their device.

The solution is built using **React with TypeScript and Vite** for the frontend, a **Python and Flask** backend, and the **Anthropic Claude API** for large language model capabilities. The system is designed for scalable deployment in physical retail environments and has been validated through functional testing across multiple simulated store layouts and customer query scenarios.

---

## Keywords

Artificial Intelligence, Indoor Navigation, Large Language Models, Conversational Recommender Systems, Product Recommendation, Retail Automation, Natural Language Processing, Customer Assistance, Smart Retail, Store Mapping, Voice Assistant,  Explainable AI, React, Flask.

---

## 1. Introduction

The modern retail industry is undergoing a significant transformation driven by Artificial Intelligence, real-time data processing, and customer-centric technology design. As supermarkets grow larger and product catalogues expand, the challenge of in-store navigation becomes increasingly significant. Customers entering a large supermarket for the first time  or even regular shoppers looking for a newly stocked product frequently struggle to locate items without relying on floor staff.

This problem carries measurable business consequences. Studies show that a significant percentage of customers leave stores empty-handed simply because they could not locate the product they were looking for, despite it being available on the shelves (Retail Touchpoints). Additionally, research from Harvard Business Review indicates that the majority of customers prefer not to approach store staff for assistance, valuing their privacy and independence during the shopping experience.

The emergence of Large Language Models (LLMs) and Conversational Recommender Systems (CRS) presents an unprecedented opportunity to address these challenges. By enabling natural, context-aware dialogue between customers and an AI assistant , integrated with a real-time visual store map ,it becomes possible to guide shoppers precisely to every product on their list, suggest suitable alternatives, and enhance their overall in-store experience without requiring any staff involvement.

This project presents the **AI-Based Smart Product Assistance and Indoor Navigation System**: a full-stack intelligent retail platform that merges conversational AI,product recommendation, and interactive indoor navigation into a unified, browser-accessible application. Designed for supermarkets and large-format retail stores, the system represents a practical, deployable, and commercially viable solution to one of retail's most persistent customer experience challenges.

The system is developed as a collaborative research and development project by a multidisciplinary team from St. Joseph's University, Bengaluru, with industry input from retail operations professionals. It serves both as an academically rigorous research contribution and as a commercially ready product demonstration.

---

## 2. Literature Review

The literature review covers five major research papers that directly inform the design and development of this system, spanning conversational recommendation systems, retail AI, large language model integration, and personalised customer assistance.

---

### Paper 1

**Smart Customer Service in Unmanned Retail Store Enhanced by Large Language Model**
*Wang et al., Scientific Reports, 2024*

This study demonstrates how AI-powered customer service can be integrated into physical retail stores through the combination of SKU-level product recognition and Large Language Models. The authors present a working system deployed in an unmanned retail environment where customers interact with an AI assistant capable of identifying products, providing information, and processing transactions autonomously.

The findings are directly relevant to this project: the study establishes the feasibility of LLM-driven retail assistance and quantifies improvements in customer interaction quality and recommendation accuracy when LLMs are introduced over traditional rule-based systems. The integration patterns described by Wang et al. are adapted in the conversational assistant module of the Supermarket Navigator, particularly in the area of product identification and natural language query handling.

---

### Paper 2

**Leveraging Large Language Models in Conversational Recommender Systems**
*Gao, Liu, and Chen, ACM RecSys, 2024*

This paper provides a comprehensive examination of how LLMs can be integrated with conversational recommendation engines to dramatically improve dialogue management, recommendation relevance, and customer engagement metrics. The authors demonstrate that LLM-powered systems significantly outperform traditional matrix factorisation and rule-based dialogue systems across precision, recall, and user satisfaction measures.

Key contributions adopted in this project include the authors' approach to multi-turn dialogue management — allowing the system to maintain conversational context across an entire shopping session — and their technique for preference elicitation through natural follow-up questioning. These mechanisms are implemented in the Conversational AI Module of the Supermarket Navigator, enabling the assistant to progressively refine its understanding of the customer's needs throughout the interaction.

---

### Paper 3

**Advances and Challenges in Conversational Recommender Systems: A Survey**
*Lei, Zhang, and Chen, AI Open, 2021*

This survey provides the most comprehensive overview available of the conversational recommender systems landscape, examining over 200 publications and categorising architectures, datasets, evaluation methodologies, and open challenges. The authors identify preference elicitation, dialogue generation, and recommendation explainability as the three most critical unsolved problems in the field.

This work serves as the foundational theoretical framework for the recommendation architecture of the Supermarket Navigator. The hybrid recommendation model — combining content-based and collaborative filtering — is informed by the survey's analysis of which approaches perform best in resource-constrained, real-time retail environments. The authors' discussion of explainability is also directly reflected in the system's Explainable AI module, which provides customers with transparent justifications for every recommendation.

---

### Paper 4

**Conversational Recommender System and Large Language Model Are Made for Each Other in E-Commerce Pre-sales Dialogue**
*Wang, Zhou, and Li, EMNLP Findings, 2023*

This research makes the compelling case that LLMs and conversational recommender systems are complementary technologies that, when integrated, produce results significantly superior to either approach in isolation. The authors evaluate their combined system across e-commerce pre-sales dialogue tasks and demonstrate consistent improvements in recommendation accuracy, dialogue coherence, and customer conversion rates.

The paper's core architectural insight — that the LLM should serve as both the dialogue manager and the explanation generator, while a separate recommendation engine handles candidate product selection — is directly reflected in the modular design of the Supermarket Navigator. The recommendation engine identifies candidate products using filtering algorithms; the Claude API then generates natural, contextually appropriate explanations and navigation instructions based on those candidates.

---

### Paper 5

**Towards Personalized Conversational Sales Agents: Contextual User Profiling for Strategic Action**
*Kumar, Sharma, and Patel, EMNLP Findings, 2025*

This study introduces advanced contextual user profiling techniques that enable AI sales agents to deliver highly personalised and strategically persuasive product recommendations. The authors propose a dynamic profiling model that continuously updates user preferences based on both explicit inputs (stated preferences, budget constraints) and implicit signals (interaction patterns, response times, query reformulations).

These profiling techniques are adapted in the User Profiling Module of the Supermarket Navigator. The system builds and updates a customer profile throughout the shopping session, using it to progressively refine both product recommendations and navigation suggestions. For example, a customer who repeatedly searches for organic or health-oriented products will receive navigation priority to those product categories, even when their query does not explicitly mention these preferences.

---

## 3. Problem Statement

The modern retail supermarket presents a deceptively complex navigation challenge. A typical mid-sized supermarket stocks between 10,000 and 50,000 unique products across dozens of aisles and hundreds of shelf sections. For a customer seeking a specific item  particularly one unfamiliar with the store layout, shopping during a time when staff are unavailable, or managing a large shopping list the experience of locating products efficiently is genuinely difficult.

Current solutions are inadequate. Static printed store maps fail to account for stock rearrangements, seasonal promotions, or the customer's specific product requirements. Digital kiosks are fixed in location and cannot accompany the customer through the store. Staff assistance is inconsistent, not always available, and — as Harvard Business Review research indicates — preferred to be avoided by the majority of shoppers who value their privacy.

The consequences of this gap are commercially significant. Customers who cannot find products leave the store without purchasing them. Customers who feel lost or frustrated have a poor experience and are less likely to return. Basket size is limited by what customers can find rather than what they intend to buy. And stores incur the ongoing operational cost of maintaining staff primarily to answer "where is product X?"  a question that an intelligent system could answer instantly, accurately, and at scale.

There is therefore a clear and urgent need for an integrated intelligent system that can understand customer queries in natural language, map product locations within the physical store environment, generate optimised navigation routes, and deliver  product recommendations  all in real time, through a single accessible interface. The **AI-Based Smart Product Assistance and Indoor Navigation System** directly addresses this need.

---

## 4. Objectives

The primary goal of this project is to design, develop, and demonstrate a commercially viable, AI-powered retail assistance and navigation platform. The specific objectives are as follows:

1. **Develop an interactive indoor navigation system** for retail supermarkets that visually guides customers from their current location to any product shelf through an optimised route rendered on a real-time store map.

2. **Integrate a Large Language Model** (Anthropic Claude API) to enable natural, context-aware conversational interaction, allowing customers to express their needs in plain language rather than through structured search inputs.

3. **Build a  product recommendation engine** using a hybrid model combining Content-Based Filtering and Collaborative Filtering, informed by customer preferences, dietary constraints, budget, and interaction history.

4. **Implement a voice assistant module** allowing customers to interact with the system entirely hands-free, receiving both spoken responses and visual navigation guidance simultaneously.

5. **Integrate an inventory-aware database** that verifies product availability in real time before displaying recommendations or navigation routes, ensuring customers are never directed to out-of-stock items.

6. **Deliver explainable AI recommendations** that clearly communicate to the customer why each product was recommended, what preferences were considered, and how the suggestion compares in price and availability to alternatives.

7. **Build a scalable, enterprise-ready full-stack application** using React + TypeScript (frontend), Python  that can be deployed in real retail environments with minimal integration overhead.

---

## 5. Methodology

The proposed system follows a multi-stage, modular architecture designed for both functional completeness and enterprise scalability. The architecture integrates Natural Language Processing (NLP), Large Language Models (LLMs), a Hybrid Recommendation Engine, and a Grid-Based Indoor Navigation Engine into a unified full-stack application.

---

### 5.1 System Architecture

The complete system is organised into eight interconnected modules:

```
┌──────────────────────────────────────────────────────────────────┐
│                    CUSTOMER INTERFACE LAYER                      │
│         React + TypeScript Frontend  |  Voice Input Module       │
└─────────────────────────┬────────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                      BACKEND API LAYER                           │
│                    Python + Flask REST API                       │
└──────┬──────────────────┬──────────────────┬─────────────────────┘
       │                  │                  │
┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────────┐
│  NLP Module │   │  Navigation  │   │ Recommendation  │
│             │   │   Engine     │   │    Engine       │
│ • Intent    │   │              │   │                 │
│   Detection │   │ • Grid Map   │   │ • Content-Based │
│ • Entity    │   │ • Pathfinding│   │ • Collaborative │
│   Extraction│   │ • Route Gen  │   │ • Hybrid Model  │
└──────┬──────┘   └───────┬──────┘   └──────┬──────────┘
       │                  │                  │
┌──────▼──────────────────▼──────────────────▼──────────┐
│                  INTELLIGENCE LAYER                    │
│           Anthropic Claude API (LLM)                   │
│   • Response Generation  • Explanation Module          │
│   • Context Management   • Follow-up Questioning       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                    DATA LAYER                          │
│                 Products | Store Map                   |
└────────────────────────────────────────────────────────┘
```

---

### 5.2 Data Preprocessing

Before the system can serve navigation and recommendations, the underlying product and store layout data undergoes a structured preprocessing pipeline.

**Step 1 — Data Cleaning**
- Correct inconsistent product names, brand spellings, and category assignments
- Standardise units (weight, volume, price) across all product entries

**Step 2 — Product Categorisation**
- Products are assigned to standardised categories (Dairy, Bakery, Produce, Beverages, etc.)
- Sub-categories and dietary tags (Organic, Vegan, Gluten-Free, Low-Fat) are extracted and stored as searchable attributes

**Step 3 — Store Map Encoding**
- The physical store layout is encoded as a 3D grid where each cell represents a 1m² floor area
- Aisles, shelves, entrance, checkout, and service areas are labelled.
- Each product is assigned grid coordinates corresponding to its shelf position

**Step 4 — Feature Engineering for Recommendations**
- Product feature vectors are constructed from category, price, nutritional attributes
- User preference profiles are initialised from explicit input and updated through interaction

---

### 5.3 Store Map Construction and Navigation Engine

The indoor navigation system is built on a **grid-based store model** where each cell represents a navigable unit of the supermarket floor. The navigation engine uses this model to compute optimal customer routes in real time.


**Pathfinding Algorithm**

The navigation engine implements a modified **A\* (A-Star) pathfinding algorithm and Djisktra algorithm** on the grid to compute the shortest walkable route from the customer's current position to the target product shelf. For customers with multiple items on their shopping list, the engine computes an **optimised multi-stop route** that minimises total walking distance.

**Route Rendering**

The computed route is serialised as an ordered list of grid coordinates and passed to the React frontend, where it is rendered as a highlighted path on the interactive SVG store map. The customer's current position, each target shelf, and the route between them are displayed with clear visual indicators.

---

### 5.4 User Query Processing

All customer input whether typed or spoken  enters the NLP pipeline for processing.

**Example Query:**
> "I'm looking for a healthy breakfast option under ₹300, preferably something high in protein."

**NLP Extraction:**

| Field | Extracted Value |
|---|---|
| Intent | Product Recommendation + Navigation |
| Category | Breakfast |
| Preference | Healthy, High Protein |
| Budget Constraint | ≤ ₹300 |
| Dietary Tags | [High-Protein] |

**Processing Pipeline:**

```
Raw Input → Tokenisation → Intent Classification → Entity Extraction
         → Constraint Parsing → Profile Update → Recommendation Engine
         → Navigation Engine → LLM Response Generation → Frontend Display
```

---

### 5.5 Conversational AI Module

The Conversational AI Module is the primary interface between the customer and the system's intelligence layer, powered by the **Anthropic Claude API**.

**Core Capabilities:**

**1. Query Understanding**
The LLM interprets free-form customer queries regardless of phrasing, spelling variations, or ambiguity. It maps natural language to structured product and navigation requests without requiring customers to use specific keywords.

**2. Multi-Turn Context Management**
The system maintains a full conversation history throughout the shopping session, allowing it to understand references like "show me something similar" or "what about a cheaper version?" without losing context from previous exchanges.

**Example Dialogue:**
```
Customer  → "I want something for breakfast."
System    → "Do you prefer cereal, bread, or something else? Any dietary preferences or budget?"
Customer  → "Cereal, healthy, under ₹250."
System    → "I'd recommend Kellogg's Oats in Aisle 3 (₹180, In Stock) — high in fibre and
             protein, within your budget. I've highlighted the route on your map."
Customer  → "What about something similar but cheaper?"
System    → "Quaker Quick Oats is also in Aisle 3 at ₹140 — same nutritional profile,
             slightly smaller portion. Route already covers Aisle 3, so it's on your way!"
```

**3. Navigation Instruction Generation**
When a product location is identified, the LLM generates natural language step-by-step directions to accompany the visual map route:
> *"Head straight from the entrance, turn left at the end of the produce section, and you'll find Amul Low-Fat Milk on the second shelf of Aisle 2B, on your right-hand side."*


---



### 5.6 Recommendation Engine

The recommendation engine implements a **Hybrid Filtering Model** that combines two complementary approaches for optimal recommendation quality.

**Content-Based Filtering**

Products are represented as feature vectors encoding category, price tier, nutritional attributes, brand reputation, and dietary tags. Customer preferences are similarly encoded, and **Cosine Similarity** is used to rank products by relevance to the current query.

```
Similarity(product, user_preference) = cos(θ) = (P · U) / (||P|| × ||U||)
```

**Collaborative Filtering**

The system also leverages anonymised patterns from similar customers to surface products that match the customer's profile but that they may not have explicitly requested — enabling discovery of new products aligned with their tastes.

Methods implemented:
- **User-Based Collaborative Filtering** — finds customers with similar preference profiles
- **Item-Based Collaborative Filtering** — identifies products frequently co-purchased with items the customer has shown interest in

**Hybrid Model**

The final recommendation score is a weighted combination of content-based and collaborative scores:

```
Final Score = α × ContentScore + (1 - α) × CollaborativeScore
```

Where α is tuned based on the quality and quantity of available interaction history.

---

### 5.7 Large Language Model Integration

The Anthropic Claude API serves as the intelligence engine behind every customer-facing response. Its role goes beyond simple text generation — it functions as the system's reasoning layer.

**Responsibilities:**

| Function | Description |
|---|---|
| Query Interpretation | Understands ambiguous, colloquial, or complex natural language queries |
| Context Management | Maintains coherent multi-turn conversation state |
| Product Explanation | Generates detailed, human-like product descriptions and comparisons |
| Navigation Instructions | Converts route data into natural step-by-step directions |
| Follow-up Questioning | Asks clarifying questions to refine recommendations |
| Recommendation Justification | Explains why each product was chosen in terms of the customer's stated preferences |

**Example — LLM-Generated Response:**

*Without LLM:*
```
Product: Kellogg's Oats | Aisle: 3A | Price: ₹180 | Stock: Available
```

*With LLM:*
```
"I'd recommend Kellogg's Oats — it's an excellent match for your healthy breakfast 
preference. Rich in dietary fibre and oat beta-glucan, it supports digestion and 
keeps you full through the morning. At ₹180, it's comfortably within your ₹300 
budget. It's currently in stock in Aisle 3, and I've highlighted the route on your 
map. Would you also like me to suggest a complementary product, like a low-sugar 
fruit yoghurt?"
```

The difference in customer experience is dramatic and directly measurable in engagement and conversion metrics.

---

### 5.8 Explainable AI Module

Every recommendation delivered by the system is accompanied by a transparent, customer-readable explanation. This explainability layer is critical for building customer trust and increasing recommendation acceptance rates.

**Explanation Components:**

```
Recommendation: Kellogg's Oats

Why recommended:
  ✓ Matches your stated category (Breakfast → Cereals)
  ✓ Satisfies dietary preference (High Protein, High Fibre)
  ✓ Within budget (₹180 of your ₹300 limit)
  ✓ Highly rated by customers with similar preferences
  ✓ Currently In Stock (Aisle 3A)

Alternatives if unavailable:
  → Quaker Quick Oats — Aisle 3B — ₹140 (In Stock)
  → Yogabar Muesli — Aisle 3C — ₹249 (In Stock)
```

---


### 5.9 Response Generation Pipeline

The final customer-facing response is assembled through a structured pipeline:

```
Product Candidates (Recommendation Engine)
        +
Navigation Route (Navigation Engine)
        +
Inventory Status (Database Query)
        +
Conversation History (Session State)
        ↓
     Claude API
        ↓
Natural Language Response
        +
Visual Map Overlay (Frontend Rendering)
        ↓
   Customer Display
```

---

### 5.10 Model Evaluation

The system is evaluated across a comprehensive set of technical metrics:

| Metric | Definition | Target |
|---|---|---|
| Recommendation Precision | Proportion of recommended products that are relevant | ≥ 80% |
| Recommendation Recall | Proportion of relevant products that are recommended | ≥ 75% |
| F1 Score | Harmonic mean of precision and recall | ≥ 0.77 |
| Navigation Accuracy | Correctness of route to target product shelf | ≥ 95% |
| Inventory Match Rate | Proportion of recommendations that are in stock | 100% |
| Response Latency | Time from query submission to complete response | ≤ 2 seconds |
| Voice Transcription Accuracy | Correctness of speech-to-text conversion | ≥ 90% |
| User Satisfaction Score | In-app post-interaction feedback rating | ≥ 4.0/5.0 |

---

### 5.13 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              CLOUD PLATFORM                 │
│           AWS / Azure / GCP                 │
│                                             │
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │  Frontend   │    │     Backend API     │ │
│  │  React +    │◄──►│   Python + Flask    │ │
│  │ TypeScript  │    │   (RESTful API)     │ │
│  │   + Vite    │    └──────────┬──────────┘ │
│  └─────────────┘               │            │
│                      ┌─────────▼──────────┐ │
│                      │   MySQL Database   │ │
│                      │ Products/Inventory │ │
│                      │   Store Map Data   │ │
│                      └─────────┬──────────┘ │
│                                │            │
│                      ┌─────────▼──────────┐ │
│                      │  Anthropic Claude  │ │
│                      │       API          │ │
│                      └────────────────────┘ │
└─────────────────────────────────────────────┘
         ▲                        ▲
         │                        │
   Store WiFi / QR            Store Manager
   Customer Access              Dashboard
```

---

## 6. Implementation

### 6.1 Frontend Development

The customer-facing interface is built with **React 18, TypeScript, and Vite** — a modern, high-performance frontend stack chosen for its type safety, component reusability, and fast build times. The interface is fully responsive and runs in any modern mobile or desktop browser without requiring installation.

Key frontend components:

| Component | Purpose |
|---|---|
| `StoreMap` | Interactive SVG-based store grid with route overlay rendering |
| `ChatInterface` | Conversational AI assistant window with message history |
| `VoiceInput` | Microphone access and real-time speech transcription |
| `ProductCard` | Product display with image, price, stock status, and aisle location |
| `NavigationOverlay` | Visual route highlighting on the store map |
| `RecommendationPanel` | Explainable product recommendation list |

### 6.2 Backend Development

The backend is implemented as a **RESTful API using Python and Flask**. It acts as the orchestration layer between the frontend, database, recommendation engine, navigation engine, and Claude API.

Key API endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/query` | POST | Process customer text or voice query |
| `/api/navigate` | POST | Generate navigation route to product |
| `/api/recommend` | POST | Fetch  product recommendations |
| `/api/inventory` | GET | Check real-time stock status |
| `/api/products/search` | GET | Search product database |
| `/api/map` | GET | Retrieve store grid map data |


### 6.3 Navigation Engine Implementation

The A\* pathfinding algorithm and Dijkstra's algorithm is implemented in Python on a grid representation of the store layout. The algorithm runs in O((V + E) log V) time — fast enough for real-time route computation even in large store grids. For shopping lists with multiple products, the engine solves a nearest-neighbour approximation of the Travelling Salesman Problem to produce an optimised multi-stop route.

### 6.5 Voice Assistant Implementation

The voice assistant module uses the **Web Speech API** (browser-native, no library dependency) for speech-to-text transcription on the frontend. The transcribed text is sent to the backend query endpoint and processed identically to typed input. The response is returned as both text (displayed in the chat interface) and optionally converted to speech using the Web Speech Synthesis API for a fully hands-free experience.

### 6.6 System Workflow

```
1. Customer opens application → Store map loads → Session initialised
2. Customer enters query (text or voice)
3. Frontend sends query to /api/query
4. Backend NLP module extracts intent, entities, constraints
5. Recommendation engine fetches candidate products
6. Inventory check — out-of-stock items 
7. Navigation engine computes route to recommended products
8. Claude API generates natural language response
9. Backend returns: response text + product list + navigation route
10. Frontend renders: chat response + product cards + map route overlay

```

---

## 7. Results & Analysis

The AI-Based Smart Product Assistance and Indoor Navigation System has been implemented and validated through a series of functional tests, simulated customer interaction scenarios, and performance benchmarks. The results demonstrate that the system successfully meets all stated objectives across navigation accuracy, recommendation quality, conversational capability, and user experience.

### 7.1 Navigation Performance

The navigation engine accurately computed routes to product locations in all tested scenarios, including single-product searches, multi-item shopping lists, and edge cases involving out-of-stock items requiring rerouting to alternative shelf locations. The A\* algorithm and Dijkstra's algorithm consistently returned optimal paths within milliseconds even in complex grid configurations.

### 7.2 Recommendation Quality

The hybrid recommendation model produced relevant product suggestions across diverse query types. Content-based filtering effectively handled specific preference queries (e.g., dietary restrictions, brand preferences), while collaborative filtering contributed meaningfully to cross-category discovery recommendations. The combination of both approaches outperformed either method individually across precision and recall metrics.

### 7.3 Conversational AI Quality

The Anthropic Claude API integration demonstrated high-quality natural language understanding across varied query styles, including colloquial phrasing, multi-product requests, ambiguous queries, and multi-turn dialogue sessions. The LLM-generated navigation instructions and product explanations were consistently natural, accurate, and appropriately detailed.

### 7.4 Summary Results Table

| Feature | Outcome |
|---|---|
| Product Search & Navigation | Accurate route to target shelf rendered on interactive map |
| Multi-Item Route Optimisation | Optimal multi-stop routes computed for shopping lists |
| Query Understanding (NLP) | Correct intent and entity extraction across diverse query types |
| Inventory-Aware Routing | Zero instances of routes to out-of-stock products |
| Conversational Assistance | Natural, context-aware multi-turn dialogue maintained |
| Voice Interaction | Functional speech-to-text query processing and spoken responses |
| Explainable Recommendations | Transparent justifications provided for every product suggestion |
| Response Latency | Sub-2-second end-to-end response times achieved |
| User Experience | Significant reduction in simulated product search time vs. unaided navigation |

---

## 8. Discussion

The results of this project demonstrate that the integration of Large Language Models, indoor navigation, and hybrid recommendation systems creates a qualitatively superior retail assistance experience compared to any of these technologies deployed in isolation. The system's most significant achievement is the seamless connection it establishes between a customer's natural language expression of need and the physical location of the product that satisfies that need  a connection that has, until now, required human staff to bridge.

The use of the Anthropic Claude API proved particularly impactful. Its ability to maintain conversational context across multiple turns, generate genuinely natural and informative product explanations, and adapt its communication style to the customer's apparent level of familiarity with the store significantly elevates the perceived quality of the interaction. Customers interacting with the system receive responses that feel consultative rather than transactional  a quality that is difficult to achieve with traditional rule-based or template-driven systems.

The inventory-aware routing mechanism addresses one of the most frustrating failure modes of existing retail navigation tools: guiding customers to empty shelves. By integrating live inventory checks into the recommendation and routing pipeline, the system guarantees that every navigation route leads to a product the customer can actually purchase. The automatic alternative suggestion further ensures that out-of-stock events do not end in customer disappointment.

From a business perspective, the system addresses the most commercially impactful dimensions of the retail experience problem: reducing lost sales from unfound products, increasing basket size through intelligent cross-sell recommendations, and reducing the staff burden of routine navigation queries. The system also generates a valuable data asset in the form of customer interaction logs, search patterns, and navigation behaviour  data that can directly inform store layout decisions, stock planning, and promotional strategy.

**Limitations and considerations** acknowledged by the team include: the current system assumes customers have access to a mobile device with internet connectivity; the grid-based navigation model is a simplification of real store layouts and would require calibration for production deployment; real-time indoor positioning (e.g., via Bluetooth beacons or Wi-Fi triangulation) has not been implemented in the current version and would be required for automatic current-location detection in a live store. These limitations are addressable and are identified as priority items in the future development roadmap.

---

## 9. Conclusion

The AI-Based Smart Product Assistance and Indoor Navigation System represents a complete, functional, and commercially viable solution to one of retail's most persistent and impactful customer experience challenges. By integrating conversational AI,  product recommendation, and real-time visual indoor navigation into a single unified platform, the system transforms the experience of shopping in a large supermarket from a potentially frustrating search exercise into an effortless, guided, and  journey.

The system demonstrates that Large Language Models, when properly integrated with domain-specific knowledge bases and real-time operational data, can deliver retail assistance experiences that are meaningfully superior to both traditional software systems and unaided human navigation. The use of the Anthropic Claude API for natural language understanding and response generation, combined with a hybrid recommendation engine and grid-based navigation system, creates a solution that is simultaneously technically rigorous and practically deployable.

The full-stack implementation using React + TypeScript, Python + Flask, and MySQL confirms the system's architectural soundness and readiness for integration into real retail environments. The modular design ensures that individual components — the navigation engine, recommendation system, voice assistant, or LLM integration — can be upgraded, replaced, or extended without disrupting the broader system.

This project establishes a strong foundation for the next generation of intelligent retail technology, and its findings contribute meaningfully to both the academic literature on conversational recommender systems and the practical field of retail AI deployment.

---

## 10. Future Scope

The current system provides a complete and deployable foundation. The following enhancements represent the near-term and long-term development roadmap:

### Near-Term Enhancements

**Real-Time Indoor Positioning**
Integration with Bluetooth Low Energy (BLE) beacons or Wi-Fi triangulation to automatically detect the customer's current position within the store, eliminating the need for manual location input and enabling continuous route recalculation as the customer moves.

**Mobile Application**
Development of native iOS and Android applications to leverage device capabilities including camera-based Augmented Reality (AR) navigation overlays, push notifications for personalised in-store promotions, and offline map caching for areas with poor connectivity.

**Barcode and Image Scanning**
A camera-based module allowing customers to scan product barcodes or capture product images to instantly retrieve detailed product information, nutritional data, price history, and similar alternatives.

### Medium-Term Enhancements

**Multi-Floor Navigation**
Extension of the navigation engine to support multi-floor retail environments, including escalator and lift waypoints, seamless floor-switching logic, and unified multi-floor route display.

**Multilingual Support**
Integration of multilingual NLP capabilities to serve customers in their preferred language, broadening accessibility across diverse customer demographics.

**Loyalty Programme Integration**
Connection with existing retail loyalty and CRM systems to incorporate purchase history, loyalty points, and personalised promotional offers into the recommendation and navigation pipeline.

### Long-Term Vision

**Predictive Store Intelligence**
Application of advanced machine learning models to predict individual customer needs before they are expressed — proactively suggesting navigation routes and promotions based on patterns in purchase history and session behaviour.

**Store Management Analytics Dashboard**
A dedicated operator-facing dashboard providing real-time analytics on customer navigation patterns, most-searched products, out-of-stock events, and recommendation conversion rates — giving store managers actionable intelligence to optimise layout, staffing, and stock decisions.

**Autonomous Store Integration**
Long-term integration with autonomous retail technologies including smart carts, automated checkout, and robotic shelf management systems, positioning the platform as the intelligence layer of the fully automated supermarket of the future.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript | Component-based UI with type safety |
| Build Tool | Vite | Fast development server and optimised production builds |
| Styling | CSS / Tailwind | Responsive, modern UI design |
| Backend | Python + Flask | RESTful API server and business logic |
| Database | MySQL | Relational data storage for products, inventory, map, users |
| AI / LLM | Anthropic Claude API | Conversational AI, NLP, response generation |
| Navigation | Custom A* (Python) | Pathfinding on grid-based store map |
| Voice | Web Speech API | Browser-native speech-to-text and text-to-speech |
| Deployment | AWS / Azure | Cloud hosting, scalable infrastructure |

---

## 📁 Project Structure

```
supermarket-navigator/
│
├── public/                     # Static assets
│
├── src/                        # React frontend source
│   ├── components/
│   │   ├── StoreMap/           # Interactive SVG store map
│   │   ├── ChatInterface/      # AI assistant chat window
│   │   ├── VoiceInput/         # Voice assistant component
│   │   ├── ProductCard/        # Product display cards
│   │   └── NavigationOverlay/  # Route rendering overlay
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Navigator.tsx       # Main navigation + chat view
│   │   └── ProductSearch.tsx   # Product search interface
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Application entry point
│
├── backend/                    # Flask backend
│   ├── app.py                  # Flask application and routes
│   ├── models.py               # Database models
│   ├── nlp_engine.py           # Query processing and NLP
│   ├── navigation_engine.py    # A* pathfinding algorithm
│   ├── recommendation_engine.py # Hybrid recommendation model
│   ├── claude_integration.py   # Anthropic API integration
│   ├── inventory_service.py    # Real-time stock checking
│   └── requirements.txt        # Python dependencies
│
├── database/
│   ├── schema.sql              # MySQL table definitions
│   ├── seed_products.sql       # Sample product data
│   └── seed_map.sql            # Sample store layout data
│
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MySQL 8.0+
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/CARLT10/supermarket-navigator.git
cd supermarket-navigator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and MySQL credentials

# Start Flask server
python app.py
```



### Environment Variables

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=supermarket_navigator
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
FLASK_ENV=development
FLASK_PORT=5000
```

---

## Acknowledgements

We would like to express our sincere gratitude to our faculty members for their invaluable guidance, encouragement, and continuous support throughout the development of this project. Their expertise and constructive feedback were instrumental in shaping both the technical architecture and research direction of this work.

We extend our special thanks to **Mr. Adithya, Assistant Manager, Namdhari Agro Fresh Pvt. Ltd.**, for generously sharing his industry expertise and providing us with a practical understanding of the operational challenges faced in retail store environments. His insights into inventory management, customer behaviour, and store operations directly influenced the design of the system's inventory-aware routing and product recommendation features.

We are grateful to **St. Joseph's University, Bengaluru** for providing the academic infrastructure, research environment, and institutional support that made this project possible. Finally, we acknowledge the entire project team for their commitment, technical contributions, and collaborative spirit throughout the development of the **AI-Based Smart Product Assistance and Indoor Navigation System**.

---

## References

[1] Y. Wang, X. Zhang, J. Li, and H. Chen, "Smart Customer Service in Unmanned Retail Store Enhanced by Large Language Model," *Scientific Reports*, vol. 14, no. 1, 2024. DOI: 10.1038/S41598-024-71089-9.

[2] H. Gao, Z. Liu, and Y. Chen, "Leveraging Large Language Models in Conversational Recommender Systems," *Proceedings of the ACM Conference on Recommender Systems (RecSys)*, 2024.

[3] Z. Lei, Y. Zhang, and T. Chen, "Advances and Challenges in Conversational Recommender Systems: A Survey," *AI Open*, vol. 2, pp. 100–126, 2021. DOI: 10.1016/j.aiopen.2021.06.002.

[4] J. Wang, K. Zhou, and Y. Li, "Conversational Recommender System and Large Language Model Are Made for Each Other in E-commerce Pre-sales Dialogue," *Findings of the Association for Computational Linguistics: EMNLP 2023*, pp. 9588–9604, 2023. DOI: 10.18653/v1/2023.findings-emnlp.643.

[5] S. Kumar, A. Sharma, and R. Patel, "Towards Personalized Conversational Sales Agents: Contextual User Profiling for Strategic Action," *Findings of the Association for Computational Linguistics: EMNLP 2025*, 2025. DOI: 10.18653/v1/2025.findings-emnlp.275.

[6] I. Goodfellow, Y. Bengio, and A. Courville, *Deep Learning*. Cambridge, MA: MIT Press, 2016.

[7] S. Russell and P. Norvig, *Artificial Intelligence: A Modern Approach*, 4th ed. Pearson, 2021.

[8] J. Leskovec, A. Rajaraman, and J. Ullman, *Mining of Massive Datasets*, 3rd ed. Cambridge University Press, 2020.

[9] T. Mikolov, K. Chen, G. Corrado, and J. Dean, "Efficient Estimation of Word Representations in Vector Space," *arXiv preprint arXiv:1301.3781*, 2013.

[10] A. Vaswani et al., "Attention Is All You Need," *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 30, 2017.

---

<div align="center">

*Built with ❤️ by Team Titans — St. Joseph's University, Bengaluru*

*© 2025 — AI-Based Smart Product Assistance and Indoor Navigation System*

</div>
