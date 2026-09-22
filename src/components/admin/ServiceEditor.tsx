import type { ManagedService } from '@/lib/services';
import { addService, saveService, setServiceCatalogStatus } from '@/app/admin/actions';
import SubmitButton from '@/components/auth/SubmitButton';
import NavigationVisibilityEditor from '@/components/admin/NavigationVisibilityEditor';

const categories = [
  ['seer', 'The Seer'], ['healer', 'The Healer'], ['alchemist', 'The Alchemist'], ['oracle', 'The Oracle'], ['journey', 'The Journey'],
] as const;

export default function ServiceEditor({ services, available }: { services: ManagedService[]; available: boolean }) {
  return <div className="account-next">
    <NavigationVisibilityEditor />
    <h2>Edit offerings</h2>
    <p className="account-fine-print">Add and maintain the services offered to clients. The displayed length updates the appointment length in Service limits automatically; daily, weekly, and monthly caps stay as configured. Hidden and deleted services disappear from booking while their past appointment records remain.</p>
    {!available ? <p role="alert">Service editing is unavailable. Apply the service catalog migration and reload this page.</p> : <>
      <details className="review-entry"><summary><strong>Add a new service</strong></summary>
        <form action={addService} className="account-form">
          <label htmlFor="new-service-title">Name</label><input id="new-service-title" name="title" minLength={2} maxLength={120} required />
          <label htmlFor="new-service-slug">Service URL key</label><input id="new-service-slug" name="slug" pattern="[a-z0-9-]{2,120}" placeholder="example-service" required />
          <label htmlFor="new-service-subtitle">Subtitle</label><input id="new-service-subtitle" name="subtitle" minLength={2} maxLength={200} required />
          <label htmlFor="new-service-category">Category</label><select id="new-service-category" name="category" defaultValue="journey">{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <label htmlFor="new-service-description">Description</label><textarea id="new-service-description" name="description" minLength={10} maxLength={3000} required />
          <label htmlFor="new-service-price">Price (USD)</label><input id="new-service-price" name="price" type="number" min="0" max="999999" step="0.01" required />
          <label htmlFor="new-service-duration">Displayed length (e.g. 30 min)</label><input id="new-service-duration" name="duration" minLength={2} maxLength={80} placeholder="30 min" required />
          <label htmlFor="new-service-who">Who it is for</label><textarea id="new-service-who" name="who_it_is_for" />
          <label htmlFor="new-service-approach">Approach</label><textarea id="new-service-approach" name="approach" />
          <label htmlFor="new-service-expect">What to expect</label><textarea id="new-service-expect" name="what_to_expect" />
          <label htmlFor="new-service-preparation">Preparation</label><textarea id="new-service-preparation" name="preparation" />
          <label htmlFor="new-service-deliverables">What clients receive (one per line)</label><textarea id="new-service-deliverables" name="deliverables" placeholder="Personal guidance" />
          <label htmlFor="new-service-realm">Journey realm</label><input id="new-service-realm" name="realm_id" defaultValue="healing" />
          <label htmlFor="new-service-chakra">Chakra</label><input id="new-service-chakra" name="chakra" defaultValue="heart" />
          <label htmlFor="new-service-color">Accent color</label><input id="new-service-color" name="color" type="color" defaultValue="#3f8f68" />
          <SubmitButton pendingLabel="Adding…">Add service</SubmitButton>
        </form>
      </details>
      {services.map(service => <details className="review-entry" key={service.slug}>
        <summary><strong>{service.title}</strong> · ${service.price} · {service.duration} {!service.isActive && !service.isDeleted ? '· Hidden' : ''}{service.isDeleted ? '· Deleted' : ''}</summary>
        {service.isDeleted ? <form action={setServiceCatalogStatus} className="account-links"><input type="hidden" name="slug" value={service.slug} /><button type="submit" name="operation" value="restore">Restore service</button></form> : <>
          <form action={saveService} className="account-form">
            <input type="hidden" name="slug" value={service.slug} />
            <label htmlFor={`title-${service.slug}`}>Name</label><input id={`title-${service.slug}`} name="title" defaultValue={service.title} minLength={2} maxLength={120} required />
            <label htmlFor={`subtitle-${service.slug}`}>Subtitle</label><input id={`subtitle-${service.slug}`} name="subtitle" defaultValue={service.subtitle} minLength={2} maxLength={200} required />
            <label htmlFor={`category-${service.slug}`}>Category</label><select id={`category-${service.slug}`} name="category" defaultValue={service.category}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <label htmlFor={`description-${service.slug}`}>Description</label><textarea id={`description-${service.slug}`} name="description" defaultValue={service.description} minLength={10} maxLength={3000} required />
            <label htmlFor={`price-${service.slug}`}>Price (USD)</label><input id={`price-${service.slug}`} name="price" type="number" min="0" max="999999" step="0.01" defaultValue={service.price} required />
            <label htmlFor={`display-duration-${service.slug}`}>Displayed length (e.g. 15 min or 1 hour)</label><input id={`display-duration-${service.slug}`} name="duration" defaultValue={service.duration} minLength={2} maxLength={80} required />
            <label htmlFor={`who-${service.slug}`}>Who it is for</label><textarea id={`who-${service.slug}`} name="who_it_is_for" defaultValue={service.whoItIsFor} />
            <label htmlFor={`approach-${service.slug}`}>Approach</label><textarea id={`approach-${service.slug}`} name="approach" defaultValue={service.approach} />
            <label htmlFor={`expect-${service.slug}`}>What to expect</label><textarea id={`expect-${service.slug}`} name="what_to_expect" defaultValue={service.whatToExpect} />
            <label htmlFor={`preparation-${service.slug}`}>Preparation</label><textarea id={`preparation-${service.slug}`} name="preparation" defaultValue={service.preparation} />
            <label htmlFor={`deliverables-${service.slug}`}>What clients receive (one per line)</label><textarea id={`deliverables-${service.slug}`} name="deliverables" defaultValue={service.deliverables.join('\n')} />
            <label htmlFor={`realm-${service.slug}`}>Journey realm</label><input id={`realm-${service.slug}`} name="realm_id" defaultValue={service.realmId} maxLength={120} required />
            <label htmlFor={`chakra-${service.slug}`}>Chakra</label><input id={`chakra-${service.slug}`} name="chakra" defaultValue={service.chakra} maxLength={80} required />
            <label htmlFor={`color-${service.slug}`}>Accent color</label><input id={`color-${service.slug}`} name="color" type="color" defaultValue={service.color} required />
            <SubmitButton pendingLabel="Saving…">Save offering</SubmitButton>
          </form>
          <form action={setServiceCatalogStatus} className="account-links"><input type="hidden" name="slug" value={service.slug} />
            {service.isActive ? <button type="submit" name="operation" value="hide">Hide from bookings</button> : <button type="submit" name="operation" value="show">Show in bookings</button>}
            <button type="submit" name="operation" value="delete">Delete service</button>
          </form>
        </>}
      </details>)}
    </>}
  </div>;
}
