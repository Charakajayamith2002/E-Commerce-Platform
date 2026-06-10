import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiTruck, FiCreditCard, FiCheck } from 'react-icons/fi'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useAppSelector } from '../../redux/hooks'
import { useCreateOrderMutation, useCreatePaymentIntentMutation } from '../../redux/api/ordersApi'
import { toast } from 'react-toastify'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

interface ShippingForm {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe')
  const [isProcessing, setIsProcessing] = useState(false)
  const { subTotal, shippingAmount, taxAmount, discountAmount, totalAmount, appliedCoupon, items } = useAppSelector((s) => s.cart)

  const [createOrder] = useCreateOrderMutation()
  const [createPaymentIntent] = useCreatePaymentIntentMutation()

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ShippingForm>({
    defaultValues: { country: 'US' }
  })

  const handleShippingSubmit = () => setStep('payment')

  const handlePlaceOrder = async () => {
    const shippingData = getValues()
    setIsProcessing(true)

    try {
      const orderResult = await createOrder({
        newAddress: {
          fullName: shippingData.fullName,
          phoneNumber: shippingData.phone,
          addressLine1: shippingData.addressLine1,
          addressLine2: shippingData.addressLine2,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
        },
        paymentMethod: paymentMethod === 'stripe' ? 2 : 3,
        couponCode: appliedCoupon,
      }).unwrap()

      const orderId = orderResult.data

      if (paymentMethod === 'stripe' && stripe && elements) {
        const intentResult = await createPaymentIntent(orderId).unwrap()
        const clientSecret = intentResult.data?.clientSecret

        if (clientSecret) {
          const cardElement = elements.getElement(CardElement)
          if (!cardElement) throw new Error('Card element not found')

          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement }
          })

          if (error) {
            toast.error(error.message || 'Payment failed')
            setIsProcessing(false)
            return
          }
        }
      }

      toast.success('Order placed successfully!')
      navigate(`/order-success/${orderId}`)
    } catch (error: any) {
      toast.error(error.data?.errors?.[0] || 'Failed to place order')
      setIsProcessing(false)
    }
  }

  return (
    <div className="container-fluid py-10">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {['Shipping', 'Payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
              (i === 0 && step === 'shipping') || (i === 1 && step === 'payment')
                ? 'bg-primary-600 text-white'
                : i === 0
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-500'
            }`}>
              {i === 0 && step === 'payment' ? <FiCheck className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`font-medium ${(i === 0 && step === 'shipping') || (i === 1 && step === 'payment') ? 'text-primary-600' : 'text-gray-500'}`}>
              {s}
            </span>
            {i < 1 && <div className="w-16 h-0.5 bg-gray-200 dark:bg-dark-border ml-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'shipping' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiTruck className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping Information</h2>
              </div>
              <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Full Name</label>
                    <input {...register('fullName', { required: true })} className="input-field" placeholder="John Doe" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Phone</label>
                    <input {...register('phone', { required: true })} className="input-field" placeholder="+1 234 567 8900" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Address Line 1</label>
                  <input {...register('addressLine1', { required: true })} className="input-field" placeholder="123 Main Street" />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Address Line 2 (optional)</label>
                  <input {...register('addressLine2')} className="input-field" placeholder="Apt, Suite, Floor..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">City</label>
                    <input {...register('city', { required: true })} className="input-field" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">State</label>
                    <input {...register('state', { required: true })} className="input-field" placeholder="NY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Postal Code</label>
                    <input {...register('postalCode', { required: true })} className="input-field" placeholder="10001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Country</label>
                    <input {...register('country', { required: true })} className="input-field" placeholder="US" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
                  Continue to Payment <FiCreditCard className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiCreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Method</h2>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                {[
                  { value: 'stripe', label: 'Credit / Debit Card', desc: 'Secured by Stripe' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                ].map((method) => (
                  <label key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" name="payment" value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value as any)}
                      className="text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{method.label}</p>
                      <p className="text-sm text-gray-500 dark:text-dark-muted">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Stripe Card Element */}
              {paymentMethod === 'stripe' && (
                <div className="mb-6 p-4 border border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1f2937',
                        '::placeholder': { color: '#9ca3af' },
                      },
                    },
                  }} />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('shipping')} className="btn-secondary">
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order • $${totalAmount.toFixed(2)}`
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-dark-bg overflow-hidden flex-shrink-0">
                    {item.productImage && <img src={item.productImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">${item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-dark-border pt-4">
              <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                <span>Subtotal</span><span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                <span>Shipping</span>
                <span className={shippingAmount === 0 ? 'text-green-600' : ''}>
                  {shippingAmount === 0 ? 'FREE' : `$${shippingAmount.toFixed(2)}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                <span>Tax</span><span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-100 dark:border-dark-border pt-2">
                <span>Total</span><span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
