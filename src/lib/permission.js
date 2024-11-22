
import { GetAuthData } from "./store";
let userType = "saleRep";
export const permissionsArray = [
  {
    userType: "superadmin",
    allows: ["00530000005AdvsAAC", "0051O00000CvAVTQA3", "0053b00000DgEVEAA3" , "0053b00000C75e8AAB" , "0053b00000DgEvqAAF"],
    permissions: {
      modules: {
        godLevel: true, //check
        store: {
          view: true  //check
        },
        order: {
          view: true, //check
          create: true, //check
        },
        emailBlast: {
          view: true, //check but work on
          create: true,
        },
        newArrivals: {
          view: true, // check
        },
        brands: {
          view: true // check
        },
        dashboard: {
          view: true,
          redirect: true
        },
        topProducts: {
          view: true, // check
          create: true,
        },
        marketingCalender: {
          view: true, //check
          create: true,
        },
        educationCenter: {
          view: true,
          create: true,
        },
        customerSupport: {
          view: true, //check
          create: true,
          childModules: {
            order_Status: {
              view: true,
              create: true //check
            },
            customer_service: {
              view: true,
              create: true //check
            },
            brandManagementApproval: {
              view: true,
              create: true //check
            },
            how_To_Guide: {
              view: true, //check
            }
          },
        },
        reports: {
          hasAccess: true,
          salesReport: {
            view: true, //check
          },
          newnessReport: {
            view: true, //check
          },
          comparisonReport: {
            view: true, //check
          },
          yearlyComparisonReport: {
            view: true, //check
          },
          targetReport: {
            view: true, //check
          },
          contactDetailedReport: {
            view: true, //off
          },
          accountTier: {
            view: true, //check
          },
          auditReport: {
            view: true, //check
            create: true ,  //check
            specify : true
          },
        },
      },
    },
  },
  {
    userType: userType,
    allows: [],
    permissions: {
      modules: {
        godLevel: false, //check
        store: {
          view: true  //check
        },
        order: {
          view: true, //check
          create: true, //check
        },
        emailBlast: {
          view: false, //check but work on
          create: false,
        },
        newArrivals: {
          view: true, // check
        },
        brands: {
          view: true // check
        },
        dashboard: {
          view: true,
          redirect: true
        },
        topProducts: {
          view: true, // check
          create: true,
        },
        marketingCalender: {
          view: true, //check
          create: true,
        },
        educationCenter: {
          view: true,
          create: true,
        },
        customerSupport: {
          view: true, //check
          create: true,
          childModules: {
            order_Status: {
              view: true,
              create: true //check
            },
            customer_service: {
              view: true,
              create: true //check
            },
            brandManagementApproval: {
              view: true,
              create: true //check
            },
            how_To_Guide: {
              view: true, //check
            }
          },
        },
        reports: {
          hasAccess: true,
          salesReport: {
            view: true, //check
          },
          newnessReport: {
            view: true, //check
          },
          comparisonReport: {
            view: true, //check
          },
          yearlyComparisonReport: {
            view: true, //check
          },
          targetReport: {
            view: true, //check
          },
          contactDetailedReport: {
            view: true, //off
          },
          accountTier: {
            view: false, //check
          },
          auditReport: {
            view: false, //check
            create: false , 
            specify : true //check
          },
        },
      },
    },
  },
  {
    userType: "Report manage c1",
    allows: ["0053b00000DgGqOAAV"],
    permissions: {
      modules: {
        godLevel: true, //check
        store: {
          view: false  //check
        },
        order: {
          view: false, //check
          create: false, //check
        },
        emailBlast: {
          view: false, //check but work on
          create: false,
        },
        newArrivals: {
          view: false, // check
        },
        brands: {
          view: false // check
        },
        dashboard: {
          view: true,
          redirect: true
        },
        topProducts: {
          view: false, // check
          create: false,
        },
        marketingCalender: {
          view: true, //check
          create: false,
        },
        educationCenter: {
          view: false,
          create: false,
        },
        customerSupport: {
          view: false, //check
          create: false,
          childModules: {
            order_Status: {
              view: false,
              create: false //check
            },
            customer_service: {
              view: false,
              create: false //check
            },
            brandManagementApproval: {
              view: false,
              create: false //check
            },
            how_To_Guide: {
              view: false, //check
            }
          },
        },
        reports: {
          hasAccess: true,
          salesReport: {
            view: true, //check
          },
          newnessReport: {
            view: false, //check
          },
          comparisonReport: {
            view: false, //check
          },
          yearlyComparisonReport: {
            view: false, //check
          },
          targetReport: {
            view: false, //check
          },
          contactDetailedReport: {
            view: true , //off
          },
          accountTier: {
            view: false, //check
          },
          auditReport: {
            view: true, //check
            create: true //check
          },
        },
      },
    },
  },
  {
    userType: "None manager",
    allows: [],
    permissions: {
      modules: {
        godLevel: false, //check
        store: {
          view: false  //check
        },
        order: {
          view: false, //check
          create: false, //check
        },
        emailBlast: {
          view: false, //check but work on
          create: false,
        },
        newArrivals: {
          view: false, // check
        },
        brands: {
          view: false // check
        },
        dashboard: {
          view: false,
          redirect: false
        },
        topProducts: {
          view: false, // check
          create: false,
        },
        marketingCalender: {
          view: false, //check
          create: false,
        },
        educationCenter: {
          view: false,
          create: false,
        },
        customerSupport: {
          view: false, //check
          create: false,
          childModules: {
            order_Status: {
              view: false,
              create: false //check
            },
            customer_service: {
              view: false,
              create: false //check
            },
            brandManagementApproval: {
              view: false,
              create: false //check
            },
            how_To_Guide: {
              view: false, //check
            }
          },
        },
        reports: {
          hasAccess: false,
          salesReport: {
            view: false, //check
          },
          newnessReport: {
            view: false, //check
          },
          comparisonReport: {
            view: false, //check
          },
          yearlyComparisonReport: {
            view: false, //check
          },
          targetReport: {
            view: false, //check
          },
          contactDetailedReport: {
            view: false , //off
          },
          accountTier: {
            view: false, //check
          },
          auditReport: {
            view: false, //check
            create: false  , //check
            specify : true
          },
        },
      },
    },
  },
];


// Get permissions based on logged in user
export async function getPermissions() {
  const authData = await GetAuthData();

  if (!authData) {
    console.log("No auth data found, or session expired.");
    return null;
  }

  const salesRepId = authData.Sales_Rep__c;


  for (const permission of permissionsArray) {
    if (permission.allows.includes(salesRepId)) {
      userType = permission.userType;
      break;
    }
  }

  const userPermissions = permissionsArray.find((p) => p.userType === userType);

  if (!userPermissions) {
    console.log("Permissions not found for the user type.");
    return null;
  }

  return userPermissions.permissions;
}
