import 'react-i18next';
import { LlmOption, WorkflowProgress } from './types/chat.types';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: {
        currencyDialog: {
          title: string;
          description: string;
          success: string;
        };
        toasts: {
          plans: {
            bankInstructionsSent: string;
            loginRequired: string;
            checkoutFailed: string;
            internationalPaymentsNotSupported: string;
            checkoutSuccess: string; // Adicionado
            checkoutCancelled: string; // Adicionado
          };
          feedback: {
            success: string;
            error: string;
            generateReplyError: string;
            replySuccess: string;
            replyError: string;
            fetchError: string;
            updateStatusError: string;
          };
          admin: {
            fetchUsersFailed: string;
            fetchUserDetailsFailed: string;
            updateCreditsSuccess: string;
            updateCreditsFailed: string;
          };
          projects: {
            fetchFailed: string;
            createSuccess: string;
            createFailed: string;
            deleteSuccess: string;
            deleteFailed: string;
            paused: string;
            resumed: string;
            statusUpdateFailed: string;
            triggerFailed: string;
            resumeNoCredits: string;
            noCreditsToStart: string;
            renameSuccess: string; // Nova chave
            renameFailed: string; // Nova chave
          };
          chat: {
            responseSaved: string;
            responseSaveFailed: string;
            outOfCredits: string;
            nextStepTriggerFailed: string;
            noCreditsToRegenerate: string;
            regenerating: string;
            regenerateFailed: string;
            startWorkflowFailed: string;
            noProjectForGSC: string;
            noGSCAnalysisPurchase: string;
            gscAnalysisTriggered: string;
            gscAnalysisTriggerFailed: string;
            fetchMessagesFailed: string;
            sendMessageFailed: string;
            you: string; // Adicionado
          };
          clipboard: {
            notAvailable: string;
            success: string;
            failed: string;
          };
          profile: {
            updateSuccess: string;
            updateFailed: string;
          };
          password: {
            updateSuccess: string;
            updateFailed: string;
          };
          fileUpload: {
            success: string;
            failed: string;
            noFileSelected: string;
            loginRequired: string;
          };
          genericError: string;
        };
        pricingDialog: {
          title: string;
          description: string;
          popular: string;
          perMonth: string;
          currentPlan: string;
          selectPlan: string;
          footerNote1: string;
          footerNote2: string;
          tiers: {
            planId: string;
            name: string;
            price: string;
            credits: number;
            features: string[];
            popular: boolean;
          }[];
          gscService: {
            serviceId: string;
            title: string;
            description: string;
            price: string;
            perAnalysis: string;
            features: string[];
            buyNow: string;
          };
        };
        header: {
          credits: string;
          upgradePlan: string;
          dashboard: string;
          profile: string;
          logout: string;
        };
        newProject: string;
        feedbackDialog: {
          button: string;
          title: string;
          description: string;
          label: string;
          placeholder: string;
          submit: string;
        };
        deleteDialog: {
          title: string;
          description: string;
          cancel: string;
          confirm: string;
        };
        chatHeader: {
          assistantName: string;
          step: string;
        };
        chatInput: {
          placeholder: string;
          disabledPlaceholder: string;
          analyze: string;
          uploadFile: string;
          analyzeLink: string;
          pause: string;
          resume: string;
          viewHistory: string;
          gscAnalysis: string;
          noCreditsTooltip: string;
          noCreditsToResumeTooltip: string;
          gscNoProjectTooltip: string;
          attachFile: string;
          fileAttached: string;
          downloadFile: string;
          gscAnalysisStarted: string; // New key
        };
        chat: {
          genericApproval: string;
          analyzingNextStep: string;
          you: string; // Adicionado
        };
        emptyChat: {
          greeting: string;
          guest: string;
          subtitle: string;
          startButton: string;
          projectNameLabel: string; // Nova chave
          projectNamePlaceholder: string; // Nova chave
          defaultProjectName: string; // Nova chave
        };
        optionSelector: {
          prompt: string;
          typeToSelect: string; // New key
        };
        progressFlow: {
          title: string;
          inProgress: string;
          nextSteps: string;
        };
        errorDisplay: {
          title: string;
          message: string;
        };
        historySheet: {
          title: string;
          description: string;
          stepLabel: string;
          workflowProgressContent: string;
          genericApprovedContent: string;
          noStepsTitle: string;
          noStepsDescription: string;
          copyAll: string;
          copied: string;
          close: string;
        };
        profilePage: {
          title: string;
          tabs: {
            profile: string;
            password: string;
            billing: string;
            feedbacks: string;
          };
          profileDetails: {
            title: string;
            description: string;
            email: string;
            fullName: string;
            save: string;
          };
          changePassword: {
            title: string;
            description: string;
            newPassword: string;
            update: string;
          };
        };
        billingInfo: {
          title: string;
          description: string;
          currentPlan: string;
          freePlan: string;
          creditsRemaining: string;
          changePlan: string;
        };
        usageHistory: {
          title: string;
          description: string;
          action: string;
          creditsUsed: string;
          date: string;
          noHistory: string;
        };
        feedbackHistory: {
          title: string;
          description: string;
          replied: string;
          yourMessage: string;
          adminResponse: string;
          noHistory: string;
        };
        admin: {
          dashboard: {
            title: string;
            allUsers: string;
            filterByPlan: string;
            allPlans: string;
            search: string;
            fullName: string;
            email: string;
            plan: string;
            credits: string;
            notApplicable: string;
            noUsersFound: string;
          };
          tabs: {
            users: string;
            feedbacks: string;
          };
          userDetail: {
            userNotFound: string;
            backToDashboard: string;
            backToUsers: string;
            manageCredits: string;
            creditBalance: string;
            updateCredits: string;
            usageHistory: string;
            last50: string;
            userProjects: string;
            projectName: string;
            status: string;
            createdAt: string;
          };
        };
        feedbackViewer: {
          title: string;
          description: string;
          user: string;
          feedback: string;
          status: string;
          actions: string;
          statuses: {
            unread: string;
            read: string;
            replied: string;
          };
          noFeedback: string;
        };
        feedbackReplyDialog: {
          title: string;
          description: string;
          userFeedback: string;
          yourReply: string;
          generate: string;
          submit: string;
          generationErrorPrefix: string;
        };
        subscriptionAlert: {
          title: string;
          expiresInDays: string;
          expiresInOneDay: string;
          expired: string;
          renew: string;
        };
        changeLanguage: string;
        portuguese: string;
        english: string;
        spanish: string;
        login: {
          welcomeTitle: string;
          welcomeSubtitle: string;
          accessAccount: string;
          signInOrCreateAccount: string;
          noAccountSignUp: string;
          alreadyHaveAccountSignIn: string;
          customSignUpLink: string;
        };
        landingPage: {
          hero: {
            title: string;
            subtitle: string;
            ctaButton: string;
            freeCreditsNote: string;
          };
          features: {
            title: string;
            subtitle: string;
            keywordResearchTitle: string;
            keywordResearchDescription: string;
            optimizedContentTitle: string;
            optimizedContentDescription: string;
            internationalExpansionTitle: string;
            internationalExpansionDescription: string;
          };
          cta: {
            title: string;
            subtitle: string;
            button: string;
          };
          footer: {
            blog: string;
            contact: string;
            faq: string;
            termsOfService: string;
            privacyPolicy: string;
            copyright: string;
            developedBy: string;
          };
        };
        faqPage: {
          backLink: string;
          title: string;
          subtitle: string;
          categories: {
            category: string;
            questions: {
              q: string;
              a: string;
            }[];
          }[];
        };
        termsPage: {
          backLink: string;
          title: string;
          intro1: string;
          intro2: string;
          section1: {
            title: string;
            p1: string;
          };
          section2: {
            title: string;
            p1: string;
          };
          section3: {
            title: string;
            p1: string;
            p2: string;
          };
          section4: {
            title: string;
            p1: string;
            p2: string;
          };
          section5: {
            title: string;
            p1: string;
            p2: string;
          };
          section6: {
            title: string;
            p1: string;
          };
          section7: {
            title: string;
            p1: string;
            p2: string;
          };
          contactTitle: string;
          contactEmail: string;
        };
        privacyPage: {
          backLink: string;
          title: string;
          intro1: string;
          intro2: string;
          definitionsTitle: string;
          definitionsList: string[];
          dataCollectionTitle: string;
          dataCollectionIntro: string;
          dataCollectionList1: string;
          dataCollectionList2: string;
          cookiesTitle: string;
          cookiesIntro: string;
          cookiesTypesTitle: string;
          cookiesTypesList: string[];
          dataProcessingTitle: string;
          dataProcessingIntro: string;
          dataProcessingList: string[];
          dataSharingTitle: string;
          dataSharingIntro: string;
          dataSharingList: string[];
          externalLinksTitle: string;
          externalLinksP1: string;
          externalLinksP2: string;
          dataSubjectRightsTitle: string;
          dataSubjectRightsIntro: string;
          dataSubjectRightsList: string[];
          dataSubjectRightsContact: string;
          dataSecurityTitle: string;
          dataSecurityP1: string;
          policyChangesTitle: string;
          policyChangesP1: string;
          contactTitle: string;
          contactEmail: string;
        };
        signUpForm: {
          title: string;
          description: string;
          fullNameLabel: string;
          fullNamePlaceholder: string;
          emailLabel: string;
          emailPlaceholder: string;
          passwordLabel: string;
          passwordPlaceholder: string;
          signUpButton: string;
          backToSignIn: string;
          success: string;
          validation: {
            fullNameMin: string;
            emailInvalid: string;
            passwordMin: string;
          };
        };
        renameDialog: { // Nova seção para o diálogo de renomear
          title: string;
          description: string;
          newNameLabel: string;
          cancel: string;
          save: string;
          rename: string; // Para o item do menu
        };
      };
    };
  }
}