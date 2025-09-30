import { useUser } from '@clerk/clerk-react';
import { useClerkUser } from '../../hooks/useClerkUser';

export function UserDebug() {
  const { user: clerkUser, isSignedIn } = useUser();
  const { user: appUser } = useClerkUser();

  if (!isSignedIn || !clerkUser) {
    return <div>User not signed in</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs">
      <h3 className="font-bold mb-2">Debug User Data:</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Clerk User:</h4>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify({
            id: clerkUser.id,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            emailAddresses: clerkUser.emailAddresses,
            unsafeMetadata: clerkUser.unsafeMetadata,
            publicMetadata: clerkUser.publicMetadata,
          }, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">App User:</h4>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify(appUser, null, 2)}
        </pre>
      </div>
    </div>
  );
}