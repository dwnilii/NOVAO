'use server';

import { promises as fs } from 'fs';
import path from 'path';

export interface AdminSettings {
  general: {
    siteName: string;
    siteDescription: string;
    favicon: string;
    logo: string;
  };
  fonts: {
    persian: Array<{
      name: string;
      path: string;
      isDefault: boolean;
    }>;
    english: Array<{
      name: string;
      path: string;
      isDefault: boolean;
    }>;
  };
  landingPage: {
    hero: {
      title: string;
      subtitle: string;
      buttonText: string;
    };
    features: {
      enabled: boolean;
      title: string;
      subtitle: string;
    };
    pricing: {
      enabled: boolean;
      title: string;
      subtitle: string;
    };
  };
  payment: {
    methods: Array<{
      id: string;
      name: string;
      enabled: boolean;
      details: string;
    }>;
    currency: string;
    currencySymbol: string;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    channelId: string;
    notificationTemplates: {
      orderReceived: string;
      orderConfirmed: string;
      orderRejected: string;
    };
  };
  clients: {
    downloadLinks: Array<{
      platform: string;
      url: string;
      enabled: boolean;
    }>;
    configurationGuides: Array<{
      platform: string;
      content: string;
      enabled: boolean;
    }>;
  };
}
