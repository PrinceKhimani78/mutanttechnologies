# Force Revalidation Script
# Use this to immediately update the live site after making admin changes

# Set your revalidation secret (default is shown below)
SECRET="mutant-revalidate-secret-2024"

# Your live site URL
SITE_URL="https://www.mutanttechnologies.com"

echo "🔄 Forcing revalidation of all pages..."

# Call the revalidation API
curl -X POST "${SITE_URL}/api/revalidate" \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"${SECRET}\"}"

echo ""
echo "✅ Revalidation triggered!"
echo "Wait 5-10 seconds and refresh your live site."
