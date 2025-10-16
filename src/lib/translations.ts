import { getSetting } from './api';

// This is a dynamic getter for the exchange rate.
// It fetches from the database, with a fallback.
async function getTomanRate(): Promise<number> {
    try {
        const rate = await getSetting('tomanRate');
        return rate ? Number(rate) : 60000;
    } catch {
        return 60000; // Fallback in case of DB error
    }
}


export const translations = {
  en: {
    welcome: 'Welcome',
    buttons: {
      serviceStore: 'Store',
      viewCart: 'View Cart',
      myOrders: 'My Orders',
      copySubLink: 'Copy Subscription Link',
      noLinkAvailable: 'No Link Available',
    },
    subscriptionStatus: {
      title: 'Subscription Status',
      plan: 'Plan',
      status: 'Status',
      expiration: 'Service Expiration',
      active: 'Active',
      inactive: 'Inactive',
      expired: 'Expired',
    },
    dataUsage: {
      title: 'Data Usage',
      used: 'Used',
      total: 'Total',
    },
    subLink: {
      title: 'Your Subscription Link',
      description: 'Scan the QR code or copy the link to add to your client.',
    },
    toast: {
      couldNotFetchLiveData: {
        title: 'Could not fetch live data',
        description: 'Displaying cached information. Please check your UUID or panel connection.',
      },
      missingConfig: {
        title: 'Missing Configuration',
        description: 'This user does not have a V2Ray Client UUID set.',
      },
      planInCart: {
        title: 'Plan already in cart',
        description: 'You can only purchase one subscription plan at a time.',
      },
      addedToCart: {
        title: 'Added to cart',
        description: 'has been added to your cart.',
      },
      cartEmpty: {
          title: 'Your cart is empty',
          description: 'Please add items to your cart before checking out.',
      },
      orderSubmitted: {
        title: 'Order Submitted!',
        description: 'Your order is pending verification. You will be notified upon completion.',
      },
      subLinkCopied: 'Subscription link copied to clipboard.',
    },
    store: {
        title: 'Service Store',
        description: 'Upgrade your plan or purchase extra data packs.',
        currency: 'Toman',
        tabs: {
            subscriptions: 'Subscriptions',
            traffic: 'Extra Traffic'
        },
        subscriptions: {
            title: 'Subscription Plans',
            description: 'Renew or upgrade your plan.'
        },
        traffic: {
            title: 'Need More Data?',
            description: 'Traffic is usable until your main service expires.',
        },
        buttons: {
            currentPlan: 'Current Plan',
            addedToCart: 'Added to Cart',
            addToCart: 'Add to Cart',
            added: 'Added',
            add: 'Add'
        },
        cannotGiftToSelf: {
            title: "Cannot Gift to Self",
            description: "You cannot purchase an item as a gift for yourself. Please use the main 'Add to Cart' button."
        }
    },
    cart: {
        title: 'Shopping Cart',
        description: 'Review your items before checkout.',
        empty: 'Your cart is empty.',
        subscription: 'Subscription',
        extraTraffic: 'Extra Traffic',
        total: 'Total',
        checkout: 'Proceed to Checkout',
        currency: 'Toman'
    },
    checkout: {
        title: 'Complete Your Purchase',
        description: 'Transfer the total amount of {total} to the card below and submit your proof of payment.',
        step1: 'Step 1: Make Payment',
        transfer: 'Transfer {total} to the following account:',
        step2: 'Step 2: Submit Proof',
        tabs: {
            receipt: 'Upload Receipt',
            text: 'Paste Text',
        },
        upload: {
            click: 'Click to upload',
            drag: 'or drag and drop',
            types: 'PNG, JPG, or GIF'
        },
        pastePlaceholder: 'Paste your transaction details, tracking code, or any other text proof here.',
        buttons: {
            cancel: 'Cancel',
            submit: 'Submit for Verification'
        },
        proofRequired: {
            title: "Payment Proof Required",
            description: "Please upload a receipt or paste transaction text.",
        },
        gift: {
            dialogTitle: "Send as a Gift",
            dialogDescription: "Enter the username of the recipient. The item will be added to your cart for them.",
            usernameLabel: "Recipient's Username",
            placeholder: "Enter the exact username",
            dialogCancel: "Cancel",
            dialogConfirm: "Add to Cart for User"
        }
    },
    creditCard: {
        copied: 'Copied!',
        copiedToClipboard: 'copied to clipboard.',
        cardHolder: 'Card Holder',
        cardNumber: 'Card Number'
    },
    orderHistory: {
        title: 'Your Order History',
        description: "Here are all the purchases you've made.",
        noOrders: 'You have no orders yet.',
        orderId: 'Order ID',
        date: 'Date',
        total: 'Total',
        status: 'Status',
        recipient: 'For: {username}',
        statuses: {
            pending: 'Pending',
            completed: 'Completed',
            rejected: 'Rejected',
        },
    }
  },
  fa: {
    welcome: 'خوش آمدید',
    buttons: {
      serviceStore: 'فروشگاه',
      viewCart: 'مشاهده سبد خرید',
      myOrders: 'سفارشات من',
      copySubLink: 'کپی لینک اشتراک',
      noLinkAvailable: 'لینکی موجود نیست',
    },
    subscriptionStatus: {
      title: 'وضعیت اشتراک',
      plan: 'پلن',
      status: 'وضعیت',
      expiration: 'تاریخ انقضای سرویس',
      active: 'فعال',
      inactive: 'غیرفعال',
      expired: 'منقضی شده',
    },
    dataUsage: {
      title: 'حجم مصرفی',
      used: 'مصرف شده',
      total: 'کل',
    },
    subLink: {
      title: 'لینک اشتراک شما',
      description: 'بارکد را اسکن کنید یا لینک را برای افزودن به کلاینت خود کپی کنید.',
    },
    toast: {
      couldNotFetchLiveData: {
        title: 'عدم دریافت اطلاعات زنده',
        description: 'اطلاعات ذخیره شده نمایش داده می‌شود. لطفاً شناسه یا اتصال پنل خود را بررسی کنید.',
      },
      missingConfig: {
        title: 'پیکربندی ناقص',
        description: 'برای این کاربر شناسه کلاینت V2Ray تنظیم نشده است.',
      },
       planInCart: {
        title: 'پلن در سبد خرید موجود است',
        description: 'در هر سفارش فقط می‌توانید یک پلن اشتراک خریداری کنید.',
      },
      addedToCart: {
        title: 'به سبد خرید اضافه شد',
        description: 'به سبد خرید شما اضافه شد.',
      },
       cartEmpty: {
          title: 'سبد خرید شما خالی است',
          description: 'لطفاً قبل از پرداخت، آیتم‌ها را به سبد خرید خود اضافه کنید.',
      },
      orderSubmitted: {
        title: 'سفارش ثبت شد!',
        description: 'سفارش شما در انتظار تأیید است. پس از تکمیل به شما اطلاع داده خواهد شد.',
      },
      subLinkCopied: 'لینک اشتراک در کلیپ‌بورد کپی شد.',
    },
     store: {
        title: 'فروشگاه سرویس',
        description: 'پلن خود را ارتقا دهید یا بسته‌های ترافیک اضافی خریداری کنید.',
        currency: 'تومان',
        tabs: {
            subscriptions: 'اشتراک‌ها',
            traffic: 'ترافیک اضافه'
        },
        subscriptions: {
            title: 'پلن‌های اشتراک',
            description: 'پلن خود را تمدید یا ارتقا دهید.'
        },
        traffic: {
            title: 'به دیتا بیشتری نیاز دارید؟',
            description: 'ترافیک اضافه تا آخرین روز سرویس فعال قابل استفاده است و پس از آن منقضی می‌شود.',
        },
        buttons: {
            currentPlan: 'پلن فعلی',
            addedToCart: 'به سبد اضافه شد',
            addToCart: 'افزودن به سبد',
            added: 'اضافه شد',
            add: 'افزودن'
        },
        cannotGiftToSelf: {
            title: "نمی‌توانید به خودتان هدیه دهید",
            description: "برای خرید برای خودتان از دکمه اصلی 'افزودن به سبد' استفاده کنید."
        }
    },
    cart: {
        title: 'سبد خرید',
        description: 'قبل از پرداخت، آیتم‌های خود را مرور کنید.',
        empty: 'سبد خرید شما خالی است.',
        subscription: 'اشتراک',
        extraTraffic: 'ترافیک اضافه',
        total: 'مجموع',
        checkout: 'ادامه جهت پرداخت',
        currency: 'تومان'
    },
    checkout: {
        title: 'تکمیل خرید',
        description: 'مبلغ کل {total} را به کارت زیر انتقال داده و رسید پرداخت خود را ارسال کنید.',
        step1: 'مرحله ۱: پرداخت',
        transfer: 'مبلغ {total} را به حساب زیر واریز کنید:',
        step2: 'مرحله ۲: ارسال رسید',
        tabs: {
            receipt: 'آپلود رسید',
            text: 'درج متن',
        },
        upload: {
            click: 'برای آپلود کلیک کنید',
            drag: 'یا فایل را بکشید و رها کنید',
            types: 'PNG, JPG, or GIF'
        },
        pastePlaceholder: 'جزئیات تراکنش، کد رهگیری یا هر متن دیگری را اینجا وارد کنید.',
        buttons: {
            cancel: 'انصراف',
            submit: 'ارسال برای تأیید'
        },
        proofRequired: {
            title: "ارسال رسید الزامی است",
            description: "لطفاً رسید را آپلود کرده یا متن تراکنش را وارد کنید.",
        },
        gift: {
            dialogTitle: "ارسال به عنوان هدیه",
            dialogDescription: "نام کاربری گیرنده را وارد کنید. آیتم برای او به سبد خرید شما اضافه خواهد شد.",
            usernameLabel: "نام کاربری گیرنده",
            placeholder: "نام کاربری دقیق را وارد کنید",
            dialogCancel: "انصراف",
            dialogConfirm: "افزودن به سبد برای کاربر"
        }
    },
    creditCard: {
        copied: 'کپی شد!',
        copiedToClipboard: 'در کلیپ‌بورد کپی شد.',
        cardHolder: 'نام صاحب کارت',
        cardNumber: 'شماره کارت'
    },
    orderHistory: {
        title: 'تاریخچه سفارشات شما',
        description: "در اینجا تمام خریدهایی که انجام داده‌اید را مشاهده می‌کنید.",
        noOrders: 'شما هنوز هیچ سفارشی ثبت نکرده‌اید.',
        orderId: 'شناسه سفارش',
        date: 'تاریخ',
        total: 'مبلغ کل',
        status: 'وضعیت',
        recipient: 'برای: {username}',
        statuses: {
            pending: 'در حال بررسی',
            completed: 'تکمیل شده',
            rejected: 'رد شده',
        },
    }
  },
};

// Exporting the rate getter separately for use in components
export { getTomanRate };
