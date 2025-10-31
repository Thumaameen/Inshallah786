# Test environment variables
echo "🔒 DHA Keys Quick Test"
echo "===================="

# Test DHA NPR Key
if [ -n "$DHA_NPR_API_KEY" ]; then
    echo "✅ DHA NPR Key exists"
else
    echo "❌ DHA NPR Key missing"
fi

# Test DHA ABIS Key
if [ -n "$DHA_ABIS_API_KEY" ]; then
    echo "✅ DHA ABIS Key exists"
else
    echo "❌ DHA ABIS Key missing"
fi

# Test Document PKI Key
if [ -n "$DOC_PKI_PRIVATE_KEY" ]; then
    echo "✅ Document PKI Key exists"
else
    echo "❌ Document PKI Key missing"
fi

# Test Quantum Encryption Key
if [ -n "$QUANTUM_ENCRYPTION_KEY" ]; then
    echo "✅ Quantum Encryption Key exists"
else
    echo "❌ Quantum Encryption Key missing"
fi

# Test Database URL
if [ -n "$DATABASE_URL" ]; then
    echo "✅ Database URL exists"
else
    echo "❌ Database URL missing"
fi