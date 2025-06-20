"use client"

import PageTemplate from "@/components/page-template"

export default function PrivacyPolicyPage() {
  return (
    <PageTemplate title="Privacy Policy" requiresWallet={false}>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300">Last updated: May 11, 2025</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to MEVX ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal
          data. This privacy policy will inform you about how we look after your personal data when you visit our
          website and tell you about your privacy rights and how the law protects you.
        </p>

        <h2>2. Data We Collect</h2>
        <p>We may collect, use, store, and transfer different kinds of personal data about you, including:</p>
        <ul>
          <li>Identity Data: includes wallet addresses, usernames, or similar identifiers.</li>
          <li>
            Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and
            location, browser plug-in types and versions, operating system and platform, and other technology on the
            devices you use to access this website.
          </li>
          <li>Usage Data: includes information about how you use our website and services.</li>
          <li>
            Transaction Data: includes details about payments to and from you and other details of products and services
            you have purchased from us.
          </li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data
          in the following circumstances:
        </p>
        <ul>
          <li>To provide and maintain our service.</li>
          <li>To notify you about changes to our service.</li>
          <li>To allow you to participate in interactive features of our service when you choose to do so.</li>
          <li>To provide customer support.</li>
          <li>To gather analysis or valuable information so that we can improve our service.</li>
          <li>To monitor the usage of our service.</li>
          <li>To detect, prevent and address technical issues.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
          used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal
          data to those employees, agents, contractors, and other third parties who have a business need to know.
        </p>

        <h2>5. Your Legal Rights</h2>
        <p>
          Under certain circumstances, you have rights under data protection laws in relation to your personal data,
          including:
        </p>
        <ul>
          <li>The right to access your personal data.</li>
          <li>The right to request correction of your personal data.</li>
          <li>The right to request erasure of your personal data.</li>
          <li>The right to object to processing of your personal data.</li>
          <li>The right to request restriction of processing your personal data.</li>
          <li>The right to request transfer of your personal data.</li>
          <li>The right to withdraw consent.</li>
        </ul>

        <h2>6. Contact Us</h2>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
        <p>Email: privacy@mevx.io</p>
      </div>
    </PageTemplate>
  )
}
