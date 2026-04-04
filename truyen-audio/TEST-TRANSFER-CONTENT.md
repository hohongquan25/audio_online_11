# Transfer Content Format Examples

## Format
`username_planname` (without accents, spaces, lowercase plan name)

## Examples

### Example 1
- Email: `user@example.com`
- Plan Name: `VIP Tháng`
- Transfer Content: `user_vipthang`

### Example 2
- Email: `nguyenvana@gmail.com`
- Plan Name: `VIP Năm`
- Transfer Content: `nguyenvana_vipnam`

### Example 3
- Email: `test.user@domain.com`
- Plan Name: `VIP 3 Tháng`
- Transfer Content: `test.user_vip3thang`

### Example 4
- Email: `admin@truyenaudio.vn`
- Plan Name: `VIP Tuần`
- Transfer Content: `admin_viptuan`

## Implementation Details

The transfer content is generated using:
1. Extract username (part before @) from email
2. Remove Vietnamese accents from plan name
3. Convert plan name to lowercase
4. Remove all spaces from plan name
5. Combine with underscore: `username_planname`

## Files Updated
- ✅ `lib/transfer-content.ts` - Utility functions created
- ✅ `app/(main)/vip/VipPlans.tsx` - Display transfer content in QR payment step
- ✅ `app/(main)/vip/page.tsx` - Pass email to VipPlans component
- ✅ `app/actions/payment.ts` - Save transfer content in payment note
