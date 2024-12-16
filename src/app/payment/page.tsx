import { completeSubscription } from '@/actions/user'
import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<{ session_id?: string; cancel?: boolean }>
}

const page = async (props: Props) => {
  const searchParams = await props.searchParams;

  const {
    cancel,
    session_id
  } = searchParams;

  if (session_id) {
    const customer = await completeSubscription(session_id)
    if (customer.status === 200) {
      return redirect('/auth/callback')
    }
  }

  if (cancel) {
    return redirect('/dashboard')
  }
}

export default page
