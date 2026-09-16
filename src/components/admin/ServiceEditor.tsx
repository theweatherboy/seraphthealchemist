import type { Service } from '@/data/services';
import { saveService } from '@/app/admin/actions';
import SubmitButton from '@/components/auth/SubmitButton';
import NavigationVisibilityEditor from '@/components/admin/NavigationVisibilityEditor';

export default function ServiceEditor({ services, available }: { services: Service[]; available: boolean }) {
  return <div className="account-next">
    <NavigationVisibilityEditor />
    <h2>Edit offerings</h2>
    <p className="account-fine-print">Update the name, description, price, and displayed length of each offering. Changes appear on the service and booking pages. Past sessions keep the name recorded when they were confirmed. Set the actual appointment length under Service limits below.</p>
    {!available ? <p role="alert">Service editing is unavailable. Apply the service catalog migration and reload this page.</p> : services.map(service =>
      <details className="review-entry" key={service.slug}>
        <summary><strong>{service.title}</strong> · ${service.price} · {service.duration}</summary>
        <form action={saveService} className="account-form">
          <input type="hidden" name="slug" value={service.slug} />
          <label htmlFor={`title-${service.slug}`}>Name</label>
          <input id={`title-${service.slug}`} name="title" defaultValue={service.title} minLength={2} maxLength={120} required />
          <label htmlFor={`subtitle-${service.slug}`}>Subtitle</label>
          <input id={`subtitle-${service.slug}`} name="subtitle" defaultValue={service.subtitle} minLength={2} maxLength={200} required />
          <label htmlFor={`description-${service.slug}`}>Description</label>
          <textarea id={`description-${service.slug}`} name="description" defaultValue={service.description} minLength={10} maxLength={3000} required />
          <label htmlFor={`price-${service.slug}`}>Price (USD)</label>
          <input id={`price-${service.slug}`} name="price" type="number" min="0" max="999999" step="0.01" defaultValue={service.price} required />
          <label htmlFor={`display-duration-${service.slug}`}>Displayed length (for example, 15 min)</label>
          <input id={`display-duration-${service.slug}`} name="duration" defaultValue={service.duration} minLength={2} maxLength={80} required />
          <SubmitButton pendingLabel="Saving…">Save offering</SubmitButton>
        </form>
      </details>
    )}
  </div>;
}
