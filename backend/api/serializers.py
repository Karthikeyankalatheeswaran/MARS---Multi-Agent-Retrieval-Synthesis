from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=5000)
    mode = serializers.ChoiceField(choices=['student', 'research'], default='student')
    namespace = serializers.CharField(max_length=100, required=False, default='')
    chat_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )


class ChatResponseSerializer(serializers.Serializer):
    answer = serializers.CharField()
    mode = serializers.CharField()
    intent = serializers.CharField(allow_null=True)
    grounding_score = serializers.FloatField(allow_null=True)
    critic_status = serializers.CharField(allow_null=True)
    critic_reason = serializers.CharField(allow_null=True)
    papers_metadata = serializers.ListField(allow_null=True)
    retrieved_sources = serializers.ListField(allow_null=True)
    agents_executed = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )


class UploadRequestSerializer(serializers.Serializer):
    file = serializers.FileField()
    namespace = serializers.CharField(max_length=100, required=False)


class ExportRequestSerializer(serializers.Serializer):
    question = serializers.CharField()
    answer = serializers.CharField()
    sources = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )


class NamespaceDeleteSerializer(serializers.Serializer):
    namespace = serializers.CharField(max_length=100)


class AgentInfoSerializer(serializers.Serializer):
    name = serializers.CharField()
    role = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    color = serializers.CharField()
