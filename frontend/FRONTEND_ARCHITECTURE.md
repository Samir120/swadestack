# Frontend Architecture - MVVM Pattern Implementation

## 🏗️ Architecture Overview

The frontend strictly follows the **MVVM (Model-View-ViewModel)** pattern as illustrated in your architecture diagram:

```
┌─────────────────────────────────────────────────────────┐
│                    VIEW LAYER                           │
│            (React Components - UI Only)                 │
│                                                          │
│  Location: src/components/                              │
│  - ServiceList.tsx                                      │
│  - PortfolioGallery.tsx                                 │
│  - ShoppingCart.tsx                                     │
│  - CheckoutForm.tsx                                     │
│                                                          │
│  Responsibility:                                         │
│  - Render UI elements                                    │
│  - Handle user interactions (clicks, inputs)            │
│  - Display data from ViewModels                         │
│  - NO business logic                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Uses ViewModels
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                 VIEWMODEL LAYER                         │
│         (Business Logic & State Management)             │
│                                                          │
│  Location: src/viewmodels/                              │
│  - portfolioViewModel.ts                                │
│  - servicesViewModel.ts                                 │
│  - cartViewModel.ts                                     │
│  - authViewModel.ts                                     │
│  - ordersViewModel.ts                                   │
│                                                          │
│  Responsibilities:                                       │
│  - Business logic (validation, calculations)            │
│  - State management (via Redux)                         │
│  - Data transformation (localization, formatting)       │
│  - Orchestrate Model layer calls                        │
│  - Expose data and actions to View                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Calls Model APIs
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   MODEL LAYER                           │
│              (Data Provider - API)                      │
│                                                          │
│  Location: src/models/api/                              │
│  - apiClient.ts (HTTP wrapper)                          │
│  - portfolioApi.ts                                      │
│  - servicesApi.ts                                       │
│  - ordersApi.ts                                         │
│  - authApi.ts                                           │
│                                                          │
│  Location: src/models/types/                            │
│  - portfolio.types.ts                                   │
│  - service.types.ts                                     │
│  - order.types.ts                                       │
│  - user.types.ts                                        │
│                                                          │
│  Responsibilities:                                       │
│  - HTTP communication with backend                      │
│  - Data serialization/deserialization                   │
│  - Type definitions                                     │
│  - NO business logic                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP Requests/Responses (JSON)
                   │
                   ▼
              ┌─────────┐
              │ Backend │
              │   API   │
              └─────────┘
```

## 📁 Detailed File Structure

```
frontend/src/
│
├── components/                    # VIEW LAYER
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageToggle.tsx
│   ├── services/
│   │   ├── ServiceList.tsx        ✅ Example implemented
│   │   ├── ServiceCard.tsx
│   │   └── ServiceDetail.tsx
│   ├── portfolio/
│   │   ├── PortfolioGallery.tsx
│   │   └── PortfolioItem.tsx
│   ├── cart/
│   │   ├── ShoppingCart.tsx
│   │   └── CartItem.tsx
│   └── checkout/
│       └── CheckoutForm.tsx
│
├── viewmodels/                    # VIEWMODEL LAYER ✅ NEW!
│   ├── portfolioViewModel.ts     ✅ Implemented
│   ├── servicesViewModel.ts      ✅ Implemented
│   ├── cartViewModel.ts          ✅ Implemented
│   ├── authViewModel.ts          ✅ Implemented
│   └── ordersViewModel.ts        ✅ Implemented
│
├── models/                        # MODEL LAYER
│   ├── api/                       # Data Providers
│   │   ├── apiClient.ts          ✅ Implemented
│   │   ├── portfolioApi.ts       ✅ Implemented
│   │   ├── servicesApi.ts        ✅ Implemented
│   │   ├── ordersApi.ts          ✅ Implemented
│   │   ├── authApi.ts            ✅ Implemented
│   │   └── contactApi.ts         ✅ Implemented
│   └── types/                     # Type Definitions
│       ├── portfolio.types.ts    ✅ Implemented
│       ├── service.types.ts      ✅ Implemented
│       ├── order.types.ts        ✅ Implemented
│       ├── user.types.ts         ✅ Implemented
│       └── common.types.ts       ✅ Implemented
│
├── store/                         # Redux Store (Part of ViewModel)
│   ├── slices/
│   │   ├── portfolioSlice.ts     ✅ Implemented
│   │   ├── servicesSlice.ts      ✅ Implemented
│   │   ├── cartSlice.ts          ✅ Implemented
│   │   ├── authSlice.ts          ✅ Implemented
│   │   └── uiSlice.ts            ✅ Implemented
│   ├── store.ts                  ✅ Implemented
│   └── hooks.ts                  ✅ Implemented
│
└── i18n/                          # Internationalization
    └── i18n.ts                    ✅ Implemented
```

## 🔄 Data Flow Example

Let's trace how data flows when a user adds a service to the cart:

### 1. **VIEW LAYER** (ServiceList.tsx)
```typescript
// User clicks "Add to Cart" button
<button onClick={() => handleAddToCart(service)}>
  Add to Cart
</button>

const handleAddToCart = (service: Service) => {
  // Calls ViewModel
  addServiceToCart(service);
};
```

### 2. **VIEWMODEL LAYER** (cartViewModel.ts)
```typescript
const addServiceToCart = (service: Service) => {
  // Business logic happens here
  // - Validation
  // - State updates via Redux
  dispatch(addToCart(service));
  
  // Could also trigger side effects like:
  // - Show success notification
  // - Update analytics
  // - Sync with backend
};
```

### 3. **MODEL LAYER** (Redux Slice)
```typescript
// cartSlice.ts manages the data structure
addToCart: (state, action: PayloadAction<Service>) => {
  // Pure data manipulation
  state.items.push({
    service: action.payload,
    quantity: 1,
  });
  // Recalculate totals
};
```

## 🎯 Layer Responsibilities

### VIEW Layer (Components)
**What it DOES:**
- ✅ Render UI elements
- ✅ Handle user events (onClick, onChange)
- ✅ Display loading/error states
- ✅ Use ViewModels via hooks

**What it DOESN'T do:**
- ❌ Business logic
- ❌ API calls
- ❌ Data transformation
- ❌ Validation logic

### VIEWMODEL Layer
**What it DOES:**
- ✅ Business logic (validation, calculations)
- ✅ State management (Redux dispatches)
- ✅ Data transformation (localization, formatting)
- ✅ Orchestrate Model layer
- ✅ Expose clean API to Views

**What it DOESN'T do:**
- ❌ UI rendering
- ❌ Direct DOM manipulation
- ❌ Direct HTTP calls (delegates to Model)

### MODEL Layer
**What it DOES:**
- ✅ HTTP communication
- ✅ Data serialization/deserialization
- ✅ Type definitions
- ✅ API endpoint definitions

**What it DOESN'T do:**
- ❌ Business logic
- ❌ State management
- ❌ UI concerns

## 💡 How to Use ViewModels in Components

### Example 1: Simple Component

```typescript
import { useServicesViewModel } from '../../viewmodels/servicesViewModel';

const ServiceCard: React.FC<{ serviceId: string }> = ({ serviceId }) => {
  // Get ViewModel
  const { 
    currentService, 
    loadServiceById, 
    getServiceName,
    formatPrice 
  } = useServicesViewModel();
  
  const language = useAppSelector(state => state.ui.language);

  useEffect(() => {
    loadServiceById(serviceId);
  }, [serviceId]);

  return (
    <div>
      <h2>{getServiceName(currentService!, language)}</h2>
      <p>{formatPrice(currentService!)}</p>
    </div>
  );
};
```

### Example 2: Form with Validation

```typescript
import { useOrdersViewModel } from '../../viewmodels/ordersViewModel';
import { useCartViewModel } from '../../viewmodels/cartViewModel';

const CheckoutForm: React.FC = () => {
  const { createOrder, validateOrderData } = useOrdersViewModel();
  const { prepareOrderData, emptyCart } = useCartViewModel();
  const [formData, setFormData] = useState({...});

  const handleSubmit = async () => {
    // ViewModel handles validation
    const validation = validateOrderData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // ViewModel prepares data
    const orderData = prepareOrderData(formData);
    
    // ViewModel handles API call
    const result = await createOrder(orderData);
    
    if (result.success) {
      emptyCart();
      navigate(`/order-confirmation/${result.order?.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## 🎨 Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single, clear responsibility
2. **Testability**: ViewModels can be unit tested without UI
3. **Reusability**: ViewModels can be shared across components
4. **Maintainability**: Business logic centralized in ViewModels
5. **Type Safety**: Full TypeScript coverage
6. **Scalability**: Easy to add new features

## 📚 Key Principles

1. **Views are dumb**: They only render and handle events
2. **ViewModels are smart**: They contain all business logic
3. **Models are passive**: They only fetch/send data
4. **State flows down**: From ViewModel to View
5. **Actions flow up**: From View to ViewModel

## ✅ Architecture Compliance Checklist

- ✅ View layer only handles rendering
- ✅ ViewModel layer contains business logic
- ✅ Model layer handles data fetching
- ✅ Clear separation between layers
- ✅ Data flows through ViewModels
- ✅ No business logic in components
- ✅ No API calls in components
- ✅ ViewModels use Model layer APIs
- ✅ Components use ViewModel hooks

## 🚀 Next Steps

1. Create more View components following the pattern
2. Expand ViewModels with additional business logic
3. Add more Model APIs as needed
4. Write unit tests for ViewModels
5. Write integration tests for complete flows

---

**This architecture is now 100% compliant with your MVVM diagram!** 🎉
